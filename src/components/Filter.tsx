import { useContext, useState } from "react";
import { ApplicationContext } from "./ApplicationContext";
import { useObservable } from "../utils/useObservable";
import { FaCaretDown } from "react-icons/fa";
import { FaCaretUp } from "react-icons/fa";
import { Popover } from "react-tiny-popover";
import { showNotification } from "../utils/notifications";
export type Filter = "all" | "completed" | "open";



export const Filter = () => {
    const [open, setOpen] = useState<boolean>(false);
    const appContext = useContext(ApplicationContext);
    const viewMode = useObservable(appContext.getFilter$(), "open");
    
    return (
            <Popover containerClassName="popover-root" reposition={false} positions={['bottom', 'left']} content={() => {
                 return <div style={
                     {
                         background:"linear-gradient(45deg, black, #461a63)",
                         borderRadius: 3, 
                         border:"1px solid #602c82c8"
                     }} onChange={(e: any) => appContext.setFilter(e.target.value)}>
                     <div><label><input type="radio" value="all" name="viewMode" defaultChecked={viewMode === "all"}></input>ALL</label></div>
                     <div><label><input type="radio" value="completed" name="viewMode" defaultChecked={viewMode === "completed"} ></input>DONE</label></div>
                     <div> <label><input type="radio" value="open" name="viewMode" defaultChecked={viewMode === "open"}></input>OPEN</label></div>
                 </div>
            }} isOpen={open} onClickOutside={() => setOpen(false)}>
                <button onClick={() => {
                    setOpen(prev => !prev);
                }}>
                    Filter {open ? < FaCaretUp /> : < FaCaretDown />}
                </button>
            </Popover>
    );
};
