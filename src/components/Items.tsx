import { useContext, useMemo, useState } from "react";
import { FaRedo, FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { Item } from "./Item";
import { ApplicationContext } from "./ApplicationContext";
import { useObservable } from "../utils/useObservable";


export const Items = () => {

    const appContext = useContext(ApplicationContext);

    const isLoading = useObservable(appContext?.getIsLoading$(), false);

    const items = useObservable(appContext?.getItems$(), []);

    const [sortBy, setSortBy] = useState<string | null>("due");

    const orderedItems = useMemo(() => {
        if (sortBy === "due") return items?.sort((a, b) => {
            const aDate = a.due ? Date.parse(a.due) : -1;
            const bDate = b.due ? Date.parse(b.due) : -1;
            return aDate - bDate;
        });
        if (sortBy === "due_asc") return items?.sort((b, a) => {
            const aDate = a.due ? Date.parse(a.due) : -1;
            const bDate = b.due ? Date.parse(b.due) : -1;
            return aDate - bDate;
        });
        return items;
    }, [items, sortBy]);

    return (
        <>
            <div style={{ display: "flex", marginBottom: 10 }}>
                <div style={{ flex: 1 }} />
                <button onClick={() => appContext?.refresh()}><FaRedo className={isLoading ? "spin" : ""} /></button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: "15%", overflow: "auto" }}>Done</th>
                            <th style={{ width: "55%", overflow: "auto" }}>Description</th>
                            <th style={{ width: "28%", overflow: "auto" }}>Due 
                                <button onClick={() => setSortBy(current => current === "due" ? "due_asc" : "due")}>
                                    {sortBy === "due" 
                                        ? <FaSortDown/>
                                        : sortBy == "due_asc" 
                                            ? <FaSortUp/>
                                            : <FaSort/>
                                    }
                                </button>
                            </th>
                            <th style={{ width: "23px", overflow: "auto" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderedItems?.map(item => <Item item={item} />)}
                    </tbody>
                </table>
            </div>
        </>);
};
