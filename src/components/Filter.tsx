import { useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";
import { useObservable } from "./useObservable";



export type Filter = "all" | "completed" | "open";



export const Filter = () => {
    const appContext = useContext(ApplicationContext);
    const viewMode = useObservable(appContext.getFilter$(), "open");
    return (
        <div onChange={(e: any) => appContext.setFilter(e.target.value)}>
            <h3>Filter</h3>
            <div><input type="radio" value="all" name="viewMode" defaultChecked={viewMode === "all"} />ALL</div>
            <div><input type="radio" value="completed" name="viewMode" defaultChecked={viewMode === "completed"} />COMPLETED</div>
            <div><input type="radio" value="open" name="viewMode" defaultChecked={viewMode === "open"} />OPEN</div>
        </div>
    );
};
