import { DndProvider } from "react-dnd";
import { Duration, FilterModel } from "../model/filterModel";
import { Add } from "./Add";
import { FilterContext } from "./ApplicationContext";
import { Filter } from "./Filter";
import { Header } from "./Header";
import { Items } from "./Items";
import React from "react";
import { TouchBackend } from "react-dnd-touch-backend";
import { HTML5Backend } from "react-dnd-html5-backend";


function detectMob() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];
    
    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}

export const App = () => {

    return (
        <div style={{display: "flex", flexDirection: "column", height: "100%", padding: 10, boxSizing: "border-box"}}> 
            <Header/>
            <DndProvider backend={detectMob() ? TouchBackend : HTML5Backend}>
                <div style={{display: "flex", flexDirection: "column", flex: 1, overflow: "auto"}}>
                    <TodaysItemsView/>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <ThisWeekView/>
                        <FutureView/>
                    </div>
                </div>
                <div style={{  
                    background:"linear-gradient(45deg, black, #461a63)",  
                    borderRadius: 3, 
                    border:"1px solid #602c82c8",
                    padding: 10
                    }}>
                    <h3>Add New Item</h3>
                    <Add/>
                </div>
            </DndProvider>
        </div>
        )
}


export const TodaysItemsView = () => {
    const filter = React.useMemo(() => new FilterModel(), []);
    return (<FilterContext.Provider value={filter}>
        <div style={{margin:2}}>
            <div style={{display:"flex", flex: 1}}><h3 style={{flex:1}}>Today</h3><Filter/></div>
            <Items/>
        </div>
    </FilterContext.Provider>)
}


export const ThisWeekView = () => {
    const filter = React.useMemo(() => new FilterModel(), []);
    filter.setStatusFilter("open");
    filter.setDuration(Duration.restOfWeek)
    return (<FilterContext.Provider value={filter}>
         <div style={{margin:2}}>
            <div style={{display:"flex", flex: 1}}><h3 style={{flex:1}}>Week</h3><Filter/></div>
            <Items/>
        </div>
    </FilterContext.Provider>)
}

export const FutureView = () => {
    const filter = React.useMemo(() => new FilterModel(), []);
    filter.setStatusFilter("open");
    filter.setDuration(Duration.nextWeekOnwards)
    return (<FilterContext.Provider value={filter}>
          <div style={{margin:2}}>
            <div style={{display:"flex", flex: 1}}><h3 style={{flex:1}}>Future</h3><Filter/></div>
            <Items/>
        </div>
    </FilterContext.Provider>)
}