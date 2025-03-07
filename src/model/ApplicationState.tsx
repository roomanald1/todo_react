import { BehaviorSubject, buffer, flatMap, interval,  never, tap } from "rxjs";
import { Filter } from "../components/Filter";
import { getCookie, removeCookie, setCookie } from "typescript-cookie";
import { User } from "src/types/User";
import { Delta } from "src/types/Delta";
import { showNotification } from "../utils/notifications";

export const isLocal = false;

export class ApplicationState {
    
    private readonly notifiedItems = new BehaviorSubject<Set<string>>(new Set<string>());

    private readonly localUrl = "http://localhost:3000";
    private readonly remoteUrl = "https://todo-okla.onrender.com";

    private baseUrl = isLocal ? this.localUrl : this.remoteUrl;

    private userSub = new BehaviorSubject<User| undefined>(undefined);
    private filterSub = new BehaviorSubject<Filter>("open");
    private itemsSub = new BehaviorSubject<any[]>([]);
    private isLoadingSub = new BehaviorSubject<boolean>(false);
    private pendingActions = new BehaviorSubject<Delta>(undefined);

    private errors = new BehaviorSubject<string|undefined>(undefined);

    constructor() {

        try{
            const fromCookie = getCookie('user');
            if (fromCookie){
                this.userSub.next(JSON.parse(fromCookie));
            }
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

        this.pendingActions
            .pipe(
                tap((x) => this.performActionLocally(x)),
                buffer(this.isLoadingSub.pipe(flatMap(isLoading => {
                    return isLoading ? never(): interval(200)
                })))
            )
            .subscribe(async deltas => {
                if (deltas?.length === 0) return;
                //Sync up with service
                const compacted = deltas.reduce((prev, curr) => {
                    if (!curr) return prev;
                    prev[curr.id] = curr;
                    return prev;
                }, {} as {[index:string]: Delta});

                for (const [id, delta] of Object.entries(compacted)) {
                    if (!delta) return;
                    switch(delta.type) {
                        case "Amend": {
                            await this.update_internal(delta.item);
                            break;
                        }
                        case "Add":{
                            await this.addItem_internal(delta.description);
                            break;
                        }
                        case "Mark":{
                            await this.toggleStatus_internal(!delta.completed ? "open" : "done", id);
                            break;
                        }
                        case "Delete":{
                            await this.deleteItem_internal(delta.id);
                            break;
                        }
                    }
                }
            await this.fetchItems();
        })
    }

    private performActionLocally(delta: Delta) {
        if (!delta) return;

        if (delta.type === "Add") {
            this.itemsSub.next([...this.itemsSub.getValue(), { id: delta.id, description: delta.description, completed: false }]);
        } else if (delta.type === "Mark") {
            if (this.filterSub.getValue() === "completed" && !delta.completed || this.filterSub.getValue() === "open" && delta.completed){
                this.itemsSub.next(this.itemsSub.getValue().filter(item => item.id !== delta.id));
            }else {
                this.itemsSub.next(this.itemsSub.getValue().map(item => item.id === delta.id ? { ...item, completed: delta.completed } : item));
            }
        } else if (delta.type ===  "Delete") {
            this.itemsSub.next(this.itemsSub.getValue().filter(item => item.id !== delta.id));
        } else if (delta.type === "Amend"){
            this.itemsSub.next(this.itemsSub.getValue().map(item => item.id === delta.item.id ? { ...item, ...delta.item } : item));
        }
    }

    checkItemsDue(){
        this.itemsSub
            .getValue()
            .filter(i => Date.now() > Date.parse(i.due) && !this.notifiedItems.getValue().has(i.id))
            .forEach(i => {
                try {
                    showNotification(`Item due: ${i.description} ${i.due}`);
                }catch(e){
                    this.errors.next(e?.toString())
                    console.log(e)
                }
                this.notifiedItems.next(this.notifiedItems.getValue().add(i.id));
            })
    }

    getIsLoading$() {
        return this.isLoadingSub.asObservable();
    }

    getItems$() {
        return this.itemsSub.asObservable();
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

    async fetchItems() {
        this.isLoadingSub.next(true);
        const filter = this.filterSub.getValue();
        const action = filter === "all" ? "/all" : filter === "completed" ? "/done" : "";

        const r = await fetch(this.baseUrl + "/api/items" + action, {
            method: "GET", 
            headers: { 
               'Content-Type': 'application/json',
               'user': this.getUser()?.email || ""
           }
        });
        const result = await r.json();
        this.itemsSub.next(result);
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
        if (v) {
            this.fetchItems();
        }
    }

    addItem(description: string){
        this.pendingActions.next({ type: "Add", description, id: Date.now().toString() });
    }
    private async addItem_internal(description: string) {
        const r = await fetch(this.baseUrl + `/api/items/add`, {
             method: "PUT", 
             headers: { 
                'Content-Type': 'application/json',
                'user': this.getUser()?.email || ""
            },
            body: `"${description}"` })
        const result = await r.text();
        console.log(result);
    }

    deleteItem(id: string){
        this.pendingActions.next({ type: "Delete", id });
    }

    private async deleteItem_internal(id: string) {
        const r = await fetch(this.baseUrl + `/api/items/remove/${id}`, { 
            method: "DELETE",
             headers: { 
                'Content-Type': 'application/json',
                'user': this.getUser()?.email || ""
             } })
        const result = await r.text();
        console.log(result);
    }

    toggleStatus(value: boolean, id: string){
        this.pendingActions.next({ type: "Mark", id, completed: !value });
    }

    private async toggleStatus_internal(value: "done" | "open", id: string) {
        const r = await fetch(this.baseUrl + `/api/items/${id}/${value}`, {
             method: "PUT", 
             headers: { 
                'Content-Type': 'application/json',
                'user': this.getUser()?.email || ""
            }, 
             body: `"${id}"` });
        const result = await r.text();
        console.log(result);
    }

    refresh(){
        this.fetchItems();
    }

    private async update_internal(item: any){
        const r = await fetch(this.baseUrl + `/api/items/upsert`, {
            method: "PUT", 
            headers: { 
               'Content-Type': 'application/json',
               'user': this.getUser()?.email || ""
           }, 
            body: `"${JSON.stringify(item, null, "").replace(/\"/g, "\\\"")}"` });
       const result = await r.text();
       console.log(result);
    }

    updateItem(item: any){
        this.pendingActions.next({ type: "Amend", item, id: item.id });
    }

    logout() {
        removeCookie('user');
        this.setUser(undefined);
        this.itemsSub.next([]);
        this.filterSub.next("open")
    }

}
