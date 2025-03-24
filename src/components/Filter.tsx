import { useContext, useState } from "react";
import { FilterContext } from "./ApplicationContext";
import { useObservable } from "../utils/useObservable";
import { FaCaretDown, FaFilter } from "react-icons/fa";
import { FaCaretUp } from "react-icons/fa";
import { Popover } from "react-tiny-popover";
import { FilterOp } from "../model/filterModel";
import { startWith } from "rxjs";

export const Filter = () => {
    const [open, setOpen] = useState<boolean>(false);
    const filterContext = useContext(FilterContext);
    const viewMode: FilterOp | undefined = useObservable(() => filterContext?.getStatusFilter$().pipe(startWith("open" as FilterOp)));
    
    return (
            <Popover containerClassName="popover-root" reposition={false} positions={['bottom', 'left']} content={() => {
                 return <div style={
                     {
                         background:"linear-gradient(45deg, black, #461a63)",
                         borderRadius: 3, 
                         border:"1px solid #602c82c8"
                     }} onChange={(e: any) => filterContext?.setStatusFilter(e.target.value)}>
                     <div><label><input type="radio" value="all" name="viewMode" defaultChecked={viewMode === "all"}></input>ALL</label></div>
                     <div><label><input type="radio" value="completed" name="viewMode" defaultChecked={viewMode === "completed"} ></input>DONE</label></div>
                     <div> <label><input type="radio" value="open" name="viewMode" defaultChecked={viewMode === "open"}></input>OPEN</label></div>
                 </div>
            }} isOpen={open} onClickOutside={() => setOpen(false)}>
                <button style={{height:30, placeSelf:"center"}} onClick={() => {
                    setOpen(prev => !prev);
                }}>
                    <FaFilter style={{fontSize:"0.8em"}}/> {open ? < FaCaretUp /> : < FaCaretDown />}
                </button>
            </Popover>
    );
};
