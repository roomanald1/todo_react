import {useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";
import { useObservable } from "./useObservable";
import { Filter } from "./Filter";
import { Add } from "./Add";



export const App = () => {
    const appContext = useContext(ApplicationContext);
    const items = useObservable(appContext.getItems$(), []);

    const isLoading = useObservable(appContext.getIsLoading$(), false)

    return (
        <div>
            <Filter/>
            <h1>TODO list</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Completed</th>
                        <th>Added On</th>
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
                        </tr>)}
                </tbody>
            </table>
            <Add/>
        </div>
        )
    }