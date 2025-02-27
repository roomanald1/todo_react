import { useContext, useState } from "react";
import { ApplicationContext } from "./ApplicationContext";
import { useObservable } from "./useObservable";
import { FaCaretDown } from "react-icons/fa";
import { FaCaretUp } from "react-icons/fa";
import { Popover } from "react-tiny-popover";
export type Filter = "all" | "completed" | "open";



export const Filter = () => {
    const [open, setOpen] = useState<boolean>(false);
    const appContext = useContext(ApplicationContext);
    const viewMode = useObservable(appContext.getFilter$(), "open");
    
    return (
            <Popover containerClassName="popover-root" reposition={false} positions={['bottom', 'left']} content={() => {
                 return <div style={
                     {
                         background:"rgba(255,255,255,0.2)", 
                         borderRadius: 3, 
                         border: "1px solid #49a09d",
                     }} onChange={(e: any) => appContext.setFilter(e.target.value)}>
                     <label><input type="radio" value="all" name="viewMode" defaultChecked={viewMode === "all"}></input>ALL</label>
                     <label><input type="radio" value="completed" name="viewMode" defaultChecked={viewMode === "completed"} ></input>DONE</label>
                     <label><input type="radio" value="open" name="viewMode" defaultChecked={viewMode === "open"}></input>OPEN</label>
                 </div>
            }} isOpen={open} onClickOutside={() => setOpen(false)}>
                <button onClick={() => setOpen(prev => !prev)}>
                    Filter {open ? < FaCaretUp /> : < FaCaretDown />}
                </button>
            </Popover>
    );
};
