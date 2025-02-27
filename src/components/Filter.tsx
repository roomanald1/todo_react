import { useContext, useState } from "react";
import { ApplicationContext } from "./ApplicationContext";
import { useObservable } from "./useObservable";
import { FaCaretDown } from "react-icons/fa";
import { FaCaretUp } from "react-icons/fa";

export type Filter = "all" | "completed" | "open";



export const Filter = () => {
    const [open, setOpen] = useState<boolean>(false);
    const appContext = useContext(ApplicationContext);
    const viewMode = useObservable(appContext.getFilter$(), "open");
    
    return (
        <div >
            <button onClick={() => setOpen(prev => !prev)}>
                Filter {open ? < FaCaretUp /> : < FaCaretDown />}
            </button>
            {open && <div style={{background:"rgba(255,255,255,0.2)", borderRadius: 3, border: "1px solid #49a09d"}} onChange={(e: any) => appContext.setFilter(e.target.value)}>
                <h3>Filter</h3>
                <div><input type="radio" value="all" name="viewMode" defaultChecked={viewMode === "all"} />ALL</div>
                <div><input type="radio" value="completed" name="viewMode" defaultChecked={viewMode === "completed"} />COMPLETED</div>
                <div><input type="radio" value="open" name="viewMode" defaultChecked={viewMode === "open"} />OPEN</div>
            </div>}
        </div>
    );
};
