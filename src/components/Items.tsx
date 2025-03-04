import { useContext } from "react";
import { FaRedo } from "react-icons/fa";
import { Item } from "./Item";
import { ApplicationContext } from "./ApplicationContext";
import { useObservable } from "../utils/useObservable";



export const Items = () => {

    const appContext = useContext(ApplicationContext);

    const isLoading = useObservable(appContext.getIsLoading$(), false);

    const items = useObservable(appContext.getItems$(), []);

    return (
        <>
            <div style={{ display: "flex", marginBottom: 10 }}>
                <div style={{ flex: 1 }} />
                <button onClick={() => appContext.refresh()}><FaRedo className={isLoading ? "spin" : ""} /></button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: "15%", overflow: "auto" }}>Done</th>
                            <th style={{ width: "80%", overflow: "auto" }}>Description</th>
                            <th style={{ width: "15%", overflow: "auto" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items?.map(item => <Item item={item} />)}
                    </tbody>
                </table>
            </div>
        </>);
};
