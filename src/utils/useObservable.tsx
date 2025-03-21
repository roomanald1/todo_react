import { useState, useEffect, useCallback, DependencyList } from "react";
import { Observable } from "rxjs";


export function useObservable<T>(observableGenerator: () => Observable<T> | undefined): T | undefined {
    const [value, update] = useState<T | undefined>();

    const cb = useCallback(() => observableGenerator(), [])
    useEffect(() => {
        const obs = cb();
        const s = obs?.subscribe(update);
        return () => s?.unsubscribe();
    }, [cb]);

    return value;
}
