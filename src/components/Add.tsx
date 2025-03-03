import { useState, useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";




export const Add = () => {
    const [value, setValue] = useState<string| undefined>(undefined);
    const appContext = useContext(ApplicationContext);
    return (
        <div style={{display: "flex", marginBottom: 10}}>
            <input style={{flex: 1}} type="text" placeholder="Description" onChange={(e) => setValue(e.target.value)} />
            <button style={{width: "100px"}} onClick={() => {
                if (!value) return;
                appContext.addItem(value);
                setValue(undefined);
            }}>Add</button>
        </div>
    );
};
