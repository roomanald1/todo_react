import { useState, useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";




export const Add = () => {
    const [value, setValue] = useState("");
    const appContext = useContext(ApplicationContext);
    return (
        <div>
            <h3>Add Item</h3>
            <input type="text" placeholder="Description" onChange={(e) => setValue(e.target.value)} />
            <button onClick={() => {
                appContext.addItem(value);
                setValue("");
            }}>Add</button>
        </div>
    );
};
