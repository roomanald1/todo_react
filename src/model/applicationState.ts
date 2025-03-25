import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, interval, map, startWith, throttleTime } from "rxjs";
import { showNotification } from "../utils/notifications";
import _uniqWith from "lodash/uniqWith";
import { FilterModel } from "./filterModel";
import { UserModel } from "./userModel";
import { parse } from "date-fns";

export const isLocal = false;

export class ApplicationState {

    private readonly notifiedItems = new BehaviorSubject<Set<string>>(new Set<string>());

    private readonly localUrl = "http://localhost:8000";
    private readonly remoteUrl = "https://todo-okla.onrender.com";

    private baseUrl = isLocal ? this.localUrl : this.remoteUrl;

    private serverItemsSub = new BehaviorSubject<Todo[]>([]);
    private userModsSub = new BehaviorSubject<TodoUpdate[]>([]);

    private isLoadingSub = new BehaviorSubject<boolean>(false);
    private errors = new BehaviorSubject<string | undefined>(undefined);

    constructor(private _user: UserModel) {

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
            .subscribe(() => {
                try {
                    if (localStorage.getItem('items')) this.serverItemsSub.next(JSON.parse(localStorage.getItem('items') ?? ""));
                    if (localStorage.getItem('user_mods')) this.userModsSub.next(JSON.parse(localStorage.getItem('user_mods') ?? ""));
                    if (localStorage.getItem('notified_items')) this.notifiedItems.next(new Set<string>(JSON.parse(localStorage.getItem('notified_items') ?? "")));
                } catch (e) {
                    console.log(e);
                }
                this.fetchItems()
            })

        this.userModsSub
            .pipe(
                throttleTime(1000, undefined, {trailing: true, leading: false}),
                filter(i => i !== undefined && i.length > 0),
                distinctUntilChanged()
            )
            .subscribe(async updates => {
                await this.update(updates);
            });
    }

    user(): UserModel {
        return this._user;
    }

    clearLocal(){
        localStorage.removeItem('items');
        this.fetchItems();
    }

    checkItemsDue() {
        if (this._user.getUser() === undefined) return;
        this.serverItemsSub
            .getValue()
            .filter(i => !i.completed && Date.now() > Date.parse(i.due ?? "") && !this.notifiedItems.getValue().has(i.id?.toString() ?? ""))
            .forEach(i => {
                try {
                    showNotification(`Due: ${i.description} ${i.due}`);
                } catch (e) {
                    this.errors.next(e?.toString())
                    console.log(e)
                }
                this.notifiedItems.next(this.notifiedItems.getValue().add(i.id?.toString() ?? ""));
                localStorage.setItem('notified_items', JSON.stringify(Array.from(this.notifiedItems.getValue())));
            })
    }

    getIsLoading$() {
        return this.isLoadingSub.asObservable();
    }

    getFilteredItems$(filterModel: FilterModel) {
        return combineLatest([this.serverItemsSub, this.userModsSub, filterModel.getStatusFilter$(), filterModel.getDuration$()])
            .pipe(
                map(([serverItems, userMods, filterOp, duration]) => {
                    const items = reconcile(serverItems, userMods);
                    const filterByToday = (item: Partial<Todo>) => {
                        if (duration) {
                            const due = Date.parse(item.due ?? "") - Date.now()
                            return due < duration.to && (duration.from == 0 ? true : due > duration.from);
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
        localStorage.setItem('items', JSON.stringify(result));
        this.serverItemsSub.next(result);
        this.isLoadingSub.next(false);
    }


    addItem(description: string) {
        const due = new Date();
        due.setDate(new Date().getDate() + 1)
        this.userModsSub.next([...this.userModsSub.getValue(), {id: Date.now(), action: "Add", data: { description, id: Date.now(), added_on: Date.now().toString(), completed: false, user_id: this._user.getUser()?.email ?? "", due: due.toString() }}]);
    }


    deleteItem(id: number) {
        this.userModsSub.next([...this.userModsSub.getValue().filter(_ => _.id !== id), {id: id, action: "Remove"}]);
    }


    toggleStatus(value: boolean, id: number) {
        const existingItem = this.serverItemsSub.getValue().find(i => i.id === id);
        if (existingItem === undefined) return;

        this.updateItem({...existingItem, completed: !value});
    }

    refresh() {
        this.clearLocal();
    }

    updateItem(item: Todo) {
        this.removeNotificationsForItem(item.id);
        this.userModsSub.next([...this.userModsSub.getValue().filter(_ => _.id !== item.id), {id: item.id, action: "Update", data : item}]);
    }

    private removeNotificationsForItem(id: number) {
        const notifications = this.notifiedItems.getValue();
        notifications.delete(id?.toString() ?? "");
        this.notifiedItems.next(notifications);
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
        this.userModsSub.next(this.userModsSub.getValue().filter(i => !items.some(l => JSON.stringify(l) === JSON.stringify(i))));
        this.serverItemsSub.next(result);
        this.isLoadingSub.next(false);
    }

    logout() {
        this._user.setUser(undefined);
        this.serverItemsSub.next([]);
        this.userModsSub.next([]);
        this.clearLocal();
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