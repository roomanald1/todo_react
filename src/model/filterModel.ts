import { BehaviorSubject } from "rxjs";

export type FilterOp = "all" | "completed" | "open";

export class Duration {
    static ticksInOneHour = 60 * 60 * 1000; // 3,600,000 ms
    static ticksInOneMinute = 60 * 1000; // 60,000 ms
    static ticksInOneDay = 24 * 60 * 60 * 1000; // 86,400,000 ms
    static today = {from: 0,to: Duration.ticksInOneDay};
    static thisWeek = {from: 0,to: Duration.ticksInOneDay*7};
    static restOfWeek = {from: Duration.ticksInOneDay,to: Duration.ticksInOneDay*7};
    static nextWeek = {from: Duration.ticksInOneDay *7,to: Duration.ticksInOneDay *14};
    static nextWeekOnwards = {from: Duration.ticksInOneDay *7,to: Duration.ticksInOneDay *365};
    static thisMonth = {from: 0,to: Duration.ticksInOneDay*30};
    static nextMonth = {from: Duration.ticksInOneDay *30,to: Duration.ticksInOneDay*60};
}

export class FilterModel {

    getDuration$(){
        return this.durationSub.asObservable();
    }

    getDuration(){
        return this.durationSub.getValue();
    }

    setDuration(duration: {from:number, to:number}){
        this.durationSub.next(duration);
    }

    getStatusFilter() {
        return this.filterSub.getValue();
    }
    getStatusFilter$() {
        return this.filterSub.asObservable();
    }

    setStatusFilter(v: FilterOp) {
        this.filterSub.next(v);
    }

    private durationSub = new BehaviorSubject<{from:number, to:number}>(Duration.today);
    private filterSub = new BehaviorSubject<FilterOp>("open");
}