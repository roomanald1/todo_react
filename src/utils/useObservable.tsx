import { useState, useEffect } from "react";
import { Observable } from "rxjs";


export function useObservable<T>(observable$: Observable<T> | undefined, initialValue?: T): T | undefined {
    const [value, update] = useState<T | undefined>(initialValue);

    useEffect(() => {
        const s = observable$?.subscribe(update);
        return () => s?.unsubscribe();
    }, [observable$]);

    return value;
}
