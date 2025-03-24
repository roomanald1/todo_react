import { BehaviorSubject } from "rxjs";

export type FilterOp = "all" | "completed" | "open";
const ticksInOneDay = 24 * 60 * 60 * 1000; // 86,400,000 ms
export class FilterModel {

    getDuration$(){
        return this.durationSub.asObservable();
    }

    setDurationToToday() {
        this.durationSub.next({from: 0,to: ticksInOneDay});
    }

    setDurationToThisWeek(){
        this.durationSub.next({from: 0,to: ticksInOneDay*7});
    }

    setDurationToRestOfWeek(){
        this.durationSub.next({from: ticksInOneDay,to: ticksInOneDay*7});
    }

    setDurationToNextWeek(){
        this.durationSub.next({from: ticksInOneDay *7,to: ticksInOneDay *14});
    }

    setDurationToNextWeekOnwards(){
        this.durationSub.next({from: ticksInOneDay *7,to: ticksInOneDay *365});
    }

    setDurationToThisMonth(){
        this.durationSub.next({from: 0,to: ticksInOneDay*30});
    }

    setDurationToNextMonth(){
        this.durationSub.next({from: ticksInOneDay *30,to: ticksInOneDay*60});
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

    private durationSub = new BehaviorSubject<{from:number, to:number}>({from: 0,to: ticksInOneDay});
    private filterSub = new BehaviorSubject<FilterOp>("open");
}