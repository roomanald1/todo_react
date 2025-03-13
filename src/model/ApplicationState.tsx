import { BehaviorSubject, buffer, combineLatest, distinctUntilChanged, filter, flatMap, interval,  map,  merge,  never, tap, throttleTime } from "rxjs";
import { Filter } from "../components/Filter";
import { getCookie, removeCookie, setCookie } from "typescript-cookie";
import { User } from "src/types/User";
import { showNotification } from "../utils/notifications";
import _uniqWith from "lodash/uniqWith";

export const isLocal = false;

export class ApplicationState {
    
    private readonly notifiedItems = new BehaviorSubject<Set<string>>(new Set<string>());

    private readonly localUrl = "http://localhost:3000";
    private readonly remoteUrl = "https://todo-okla.onrender.com";

    private baseUrl = isLocal ? this.localUrl : this.remoteUrl;

    private userSub = new BehaviorSubject<User| undefined>(undefined);
    private filterSub = new BehaviorSubject<Filter>("open");
    private itemsSub = new BehaviorSubject<Partial<Todo>[]>([]);
    private isLoadingSub = new BehaviorSubject<boolean>(false);
    private pendingActions = new BehaviorSubject<Partial<Todo> | undefined>(undefined);

    private todaySub = new BehaviorSubject<boolean>(true);

    private errors = new BehaviorSubject<string|undefined>(undefined);

    constructor() {

        try{
            const fromCookie = getCookie('user');
            if (fromCookie){
                this.userSub.next(JSON.parse(fromCookie));
            }

            this.itemsSub.next(JSON.parse(localStorage.getItem('items') ?? ""));
        }catch(e){
            console.log(e);
        }

        this.fetchItems().then(_ => {
            this.checkItemsDue();
        })
      
        //fetch items every 60 seconds
        interval(1000*60).subscribe(async () => {
            await this.fetchItems();
            this.checkItemsDue();
        });

        this.pendingActions.subscribe(updates => {
            if (updates){
                this.performActionLocally(updates)
            }
        });


        this.itemsSub .pipe( 
            filter(i => i !== undefined && i.length > 0),
            distinctUntilChanged()
        )
        .subscribe(async _ => {
            localStorage.setItem('items', JSON.stringify(this.itemsSub.getValue()));
        });

        this.itemsSub
            .pipe( 
                throttleTime(2000),
                filter(i => i !== undefined && i.length > 0),
                distinctUntilChanged()
            )
            .subscribe(async _ => {
                await this.fetchItems();
                await this.set(this.itemsSub.getValue());
            });
    }

    private performActionLocally(delta: Partial<Todo>) {
        if (!delta) return;
        const currentItems = this.itemsSub.getValue() ?? [];
        const existingItem = currentItems.find(i => i.id === delta.id);
        const isAdd = existingItem === undefined;
        if (isAdd)
        {
            this.itemsSub.next([...currentItems, { ...delta, last_updated: Date.now().toString()}]);
        }else {
            this.itemsSub.next(currentItems.map(i =>{
                if (i.id === delta.id){
                    return ({...i, ...delta, last_updated: Date.now().toString()});
                }
                return i;
            }));
        }
    }

    private reconcile(oldItems: Todo[], newItems: Partial<Todo>[]) {
        //console.log("recon start", oldItems, newItems);
        const allItems = [...newItems, ...oldItems]
            .sort((a,b) => Number(a.last_updated ?? a.added_on ?? "") < Number(b.last_updated ?? b.added_on ?? "") ? 1 : -1);

        //console.log("recon sorted", allItems)
        const uniqueItems = _uniqWith(allItems, (a, b) => a.id === b.id);

        //console.log("recon result", uniqueItems)
        return uniqueItems;
    }

    checkItemsDue(){
        this.itemsSub
            .getValue()
            .filter(i => !i.completed && Date.now() > Date.parse(i.due ?? "") && !this.notifiedItems.getValue().has(i.id?.toString() ?? ""))
            .forEach(i => {
                try {
                    showNotification(`Item due: ${i.description} ${i.due}`);
                }catch(e){
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
         return combineLatest([this.itemsSub, this.filterSub, this.todaySub])
             .pipe(
                 map(([items, filterOp, today]) => {
                    const filterByToday = (item: Partial<Todo>) => {
                        if (today){
                            const today_1 = new Date();
                            today_1.setDate(new Date().getDate() + 1)
                            return Date.parse(item.due ?? "") < today_1.getTime()
                        }else {
                            return true;
                        }
                    }

                     switch(filterOp){
                         case "all":
                             return items.filter(i => filterByToday(i));
                         case "completed":
                             return items.filter(i => i.completed === true && filterByToday(i));
                         case "open":
                             return items.filter(i => !i.completed && filterByToday(i));
                     }
                 }),
                 map(_ => _.filter(i => !i.is_deleted))
             )
    }

    getUser() {
        return this.userSub.getValue();
    }
    getUser$() {
        return this.userSub.asObservable();
    }

    getNotifiedMessages$(){
        return this.notifiedItems.asObservable();
    }

    getErrors$() {
        return this.errors.asObservable();
    }

    setUser(v: any) {
        this.userSub.next(v);
        setCookie('user', JSON.stringify(v));
        if (v) {
            this.fetchItems();
        }
    }

    getToday$(){
        return this.todaySub.asObservable();
    }

    toggleToday(){
        this.todaySub.next(!this.todaySub.getValue());
    }

    async fetchItems() {
        this.isLoadingSub.next(true);
        const r = await fetch(this.baseUrl + "/api/get", {
            method: "GET", 
            headers: { 
               'Content-Type': 'application/json',
               'user': this.getUser()?.email || ""
           }
        });
        const result = await r.json();

        this.itemsSub.next(this.reconcile(result, this.itemsSub.getValue()));
        this.isLoadingSub.next(false);
    }

    getFilter() {
        return this.filterSub.getValue();
    }
    getFilter$() {
        return this.filterSub.asObservable();
    }
    setFilter(v: Filter) {
        this.filterSub.next(v);
    }

    addItem(description: string){
        const due = new Date();
        due.setDate(new Date().getDate() + 1)
        this.pendingActions.next({ description, id: Date.now(), added_on: Date.now().toString(), completed: false, user_id: this.getUser()?.email, due: due.toString()});
    }

    deleteItem(id: number){
        this.pendingActions.next({ id, is_deleted: true });
    }


    toggleStatus(value: boolean, id: number){
        this.pendingActions.next({ id, completed: !value });
    }

    refresh(){
        this.fetchItems();
    }

    updateItem(item: Todo){
        this.pendingActions.next({...item});
    }

    private async set(items: Partial<Todo>[]){
        const r = await fetch(this.baseUrl + `/api/set`, {
            method: "PUT", 
            headers: { 
               'Content-Type': 'application/json',
               'user': this.getUser()?.email || ""
           }, 
            body: `"${JSON.stringify(items, null, "").replace(/\"/g, "\\\"")}"` });
       const result = await r.text();
       console.log(result);
    }



    logout() {
        removeCookie('user');
        this.setUser(undefined);
        this.itemsSub.next([]);
        this.filterSub.next("open")
    }

}




export type Todo = {
    id: number;
    description: string;
    completed: boolean;
    is_deleted?: boolean;
    due?: string;
    added_on: string;
    detail?: string;
    user_id: string;
    last_updated?: string;
}