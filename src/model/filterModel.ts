import { BehaviorSubject } from "rxjs";

export type FilterOp = "all" | "completed" | "open";

export class FilterModel {
    getToday$() {
        return this.todaySub.asObservable();
    }

    toggleToday() {
        this.todaySub.next(!this.todaySub.getValue());
    }

    getFilter() {
        return this.filterSub.getValue();
    }
    getFilter$() {
        return this.filterSub.asObservable();
    }

    setFilter(v: FilterOp) {
        this.filterSub.next(v);
    }

    private todaySub = new BehaviorSubject<boolean>(true);

    private filterSub = new BehaviorSubject<FilterOp>("open");
}