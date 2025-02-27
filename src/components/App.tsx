import {useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";
import { useObservable } from "./useObservable";
import { Filter } from "./Filter";
import { Add } from "./Add";
import {FaRedo, FaSpinner} from "react-icons/fa";

export const App = () => {
    const appContext = useContext(ApplicationContext);
    const items = useObservable(appContext.getItems$(), []);

    const isLoading = useObservable(appContext.getIsLoading$(), false)

    const user = useObservable(appContext.getUser$(), {})
    return (
        <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
            <div style={{display: "flex", margin: 10}}>
                <div style={{flex: 1}}/>
                <Filter/>
            </div>
            <h1>{user.given_name}'s TODOs</h1>
            <div style={{display: "flex", margin: 10}}>
                <div style={{flex: 1}}/>
                <button onClick={() => appContext.refresh()}><FaRedo className={isLoading ? "spin" : ""} /></button>
            </div>
            <div style={{flex: 1}}>
                <table >
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Completed</th>
                        <th>Added On</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody>
                    {items?.map(item => 
                        <tr className={item.completed ? "completed": "open"} key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.description}</td>
                            <td><button onClick={() => appContext.toggleStatus(item.completed, item.id)}>{item.completed?.toString()}</button></td>
                            <td>{item.added_on}</td>
                            <td><button onClick={() => appContext.deleteItem(item.id)}>X</button></td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
            <Add/>
        </div>
        )
    }