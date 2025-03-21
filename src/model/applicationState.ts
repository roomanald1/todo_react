import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, interval, map, startWith, throttleTime } from "rxjs";
import { showNotification } from "../utils/notifications";
import _uniqWith from "lodash/uniqWith";
import { FilterModel } from "./filterModel";
import { UserModel } from "./userModel";

export const isLocal = false;

export class ApplicationState {

    private readonly notifiedItems = new BehaviorSubject<Set<string>>(new Set<string>());

    private readonly localUrl = "http://localhost:8000";
    private readonly remoteUrl = "https://todo-okla.onrender.com";

    private baseUrl = isLocal ? this.localUrl : this.remoteUrl;

    private serverItemsSub = new BehaviorSubject<Todo[]>([]);
    private userModsSub = new BehaviorSubject<TodoUpdate[]>([]);

    private isLoadingSub = new BehaviorSubject<boolean>(false);

    private _filter = new FilterModel();
    private _user = new UserModel();
    private errors = new BehaviorSubject<string | undefined>(undefined);

    constructor() {

        try {
            this.serverItemsSub.next(JSON.parse(localStorage.getItem('items') ?? ""));
            this.userModsSub.next(JSON.parse(localStorage.getItem('user_mods') ?? ""));
        } catch (e) {
            console.log(e);
        }

        //fetch items every 20 seconds
        interval(1000 * 20)
            .pipe(startWith(0))
            .subscribe(async () => {
                await this.fetchItems();
                this.checkItemsDue();
            });


        this._user
            .getUser$()
            .pipe(filter(i => i !== undefined))
            .subscribe(() => this.fetchItems())

        this.serverItemsSub
            .subscribe(async value => {
                localStorage.setItem('items', JSON.stringify(value));
            });

        this.userModsSub
            .pipe(
                throttleTime(2000),
                filter(i => i !== undefined && i.length > 0),
                distinctUntilChanged()
            )
            .subscribe(async updates => {
                await this.update(updates);
            });
    }


    filter(): FilterModel {
        return this._filter;
    }

    user(): UserModel {
        return this._user;
    }


    clearLocal(){
        localStorage.removeItem('items');
        this.fetchItems();
    }

    checkItemsDue() {
        this.serverItemsSub
            .getValue()
            .filter(i => !i.completed && Date.now() > Date.parse(i.due ?? "") && !this.notifiedItems.getValue().has(i.id?.toString() ?? ""))
            .forEach(i => {
                try {
                    showNotification(`Item due: ${i.description} ${i.due}`);
                } catch (e) {
                    this.errors.next(e?.toString())
                    console.log(e)
                }
                this.notifiedItems.next(this.notifiedItems.getValue().add(i.id?.toString() ?? ""));
            })
    }

    getIsLoading$() {
        return this.isLoadingSub.asObservable();
    }

    getItems$() {
        return combineLatest([this.serverItemsSub, this.userModsSub, this._filter.getFilter$(), this._filter.getToday$()])
            .pipe(
                map(([serverItems, userMods, filterOp, today]) => {
                    const items = reconcile(serverItems, userMods);
                    const filterByToday = (item: Partial<Todo>) => {
                        if (today) {
                            const today_1 = new Date();
                            today_1.setDate(new Date().getDate() + 1)
                            return Date.parse(item.due ?? "") < today_1.getTime()
                        } else {
                            return true;
                        }
                    }

                    switch (filterOp) {
                        case "all":
                            return items.filter(i => filterByToday(i));
                        case "completed":
                            return items.filter(i => i.completed === true && filterByToday(i));
                        case "open":
                            return items.filter(i => !i.completed && filterByToday(i));
                    }
                })
            )
    }


    getNotifiedMessages$() {
        return this.notifiedItems.asObservable();
    }

    getErrors$() {
        return this.errors.asObservable();
    }

    async fetchItems() {
        this.isLoadingSub.next(true);
        const r = await fetch(this.baseUrl + "/api/get", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'user': this._user.getUser()?.email || ""
            }
        });
        const result = await r.json();

        this.serverItemsSub.next(result);
        this.isLoadingSub.next(false);
    }


    addItem(description: string) {
        const due = new Date();
        due.setDate(new Date().getDate() + 1)
        this.userModsSub.next([...this.userModsSub.getValue(), {id: Date.now(), action: "Add", data: { description, id: Date.now(), added_on: Date.now().toString(), completed: false, user_id: this._user.getUser()?.email ?? "", due: due.toString() }}]);
    }


    deleteItem(id: number) {
        this.userModsSub.next([...this.userModsSub.getValue().filter(_ => _.id === id), {id: id, action: "Remove"}]);
    }


    toggleStatus(value: boolean, id: number) {
        const existingItem = this.serverItemsSub.getValue().find(i => i.id === id);
        if (existingItem === undefined) return;
        this.userModsSub.next([...this.userModsSub.getValue().filter(_ => _.id === id), {id: id, action: "Update", data : {...existingItem, completed: !value}}]);
    }

    refresh() {
        this.clearLocal();
    }

    updateItem(item: Todo) {

        this.userModsSub.next([...this.userModsSub.getValue().filter(_ => _.id === item.id), {id: item.id, action: "Update", data : item}]);
    }

    private async update(items: TodoUpdate[]) {
        this.isLoadingSub.next(true);
        const r = await fetch(this.baseUrl + `/api/update`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'user': this._user.getUser()?.email || ""
            },
            body: JSON.stringify(items)
        });
        const result = await r.json();
        //remove ONLY processed items. since new items may have been added whilst syncing
        this.userModsSub.next(this.userModsSub.getValue().filter(i => items.find(l => JSON.stringify(l) === JSON.stringify(i)) === undefined));
        this.serverItemsSub.next(result);
        this.isLoadingSub.next(false);
    }

    logout() {
        this._user.setUser(undefined);
        this.serverItemsSub.next([]);
        this.userModsSub.next([]);
        this._filter.setFilter("open")
    }

}

export function reconcile(serverItems: Todo[], userMod: TodoUpdate[]): Todo[] {
    return serverItems
        //Remove    
        .filter(_ => userMod.find(i => i.id === _.id && i.action === "Remove") === undefined) 
        //Update
        .map(_ => {
            const update = userMod.find(i => i.id === _.id);
            if (update?.action == "Update" && update) {
                return update.data;
            }
            return _;
        })
        //Add
        .concat(userMod.filter(i => i.action === "Add").map(i => i.data))
}

export type Todo = {
    id: number;
    description: string;
    completed: boolean;
    due?: string;
    added_on: string;
    detail?: string;
    user_id: string;
    last_updated?: string;
}

export type TodoUpdate = TodoUpdateAction | TodoAddAction | TodoRemoveAction;

export type TodoUpdateAction = {
    id: number;
    action : "Update",
    data: Todo;
}

export type TodoAddAction = {
    id: number;
    action : "Add",
    data: Todo;
}
export type TodoRemoveAction = {
    id: number;
    action : "Remove"
}