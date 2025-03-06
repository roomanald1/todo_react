import { useState, useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";
import React from "react";
import { showNotification } from "../utils/notifications";


export const Add = () => {
    const [value, setValue] = useState<string>("");
    const appContext = useContext(ApplicationContext);

    const add = React.useCallback(() => {
        if (!value) return;
        setValue("");
        appContext.addItem(value);
        showNotification(`Added ${value}`)
    }, [setValue, value, appContext])

    return (
        <div style={{display: "flex", marginBottom: 20, marginTop: 5}}>
            <input 
                onKeyDown={(e) => e.key === "Enter" && add()} 
                onFocus={(e) => e.currentTarget.scrollIntoView()}
                style={{flex: 1}} 
                defaultValue={value} 
                type="text" 
                placeholder="Description" 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                 />
            <button onClick={add} type="submit" style={{width: "100px"}}>Add</button>
        </div>
    );
};

