import { useState, useEffect, useCallback, DependencyList } from "react";
import { Observable } from "rxjs";


export function useObservable<T>(observableGenerator: () => Observable<T> | undefined, initialValue?: T, deps?: DependencyList): T | undefined {
    const [value, update] = useState<T | undefined>(initialValue);

    const cb = useCallback(observableGenerator, [deps])
    useEffect(() => {
        const obs = cb();
        const s = obs?.subscribe(update);
        return () => s?.unsubscribe();
    }, [cb]);

    return value;
}
