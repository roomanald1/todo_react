import {useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";
import { useObservable } from "./useObservable";
import { Filter } from "./Filter";
import { Add } from "./Add";
import {FaRedo, FaCheck, FaCircle} from "react-icons/fa";
import { googleLogout } from "@react-oauth/google";

export const App = () => {
    const appContext = useContext(ApplicationContext);
    const items = useObservable(appContext.getItems$(), []);

    const isLoading = useObservable(appContext.getIsLoading$(), false)

    const user = useObservable(appContext.getUser$(), undefined)
    return (
        <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
           
            <div style={{display: "flex", margin: 10}}>
                <button onClick={() => {
                    googleLogout();
                    appContext.logout();
                }}>Log Out</button>
                <div style={{flex: 1}}/>
                <Filter/>
            </div>
            <h1>{user?.given_name}'s TODOs</h1>
            <div style={{display: "flex", margin: 10}}>
                <div style={{flex: 1}}/>
                <button onClick={() => appContext.refresh()}><FaRedo className={isLoading ? "spin" : ""} /></button>
            </div>
            <div style={{flex: 1, overflow: "auto"}}>
                <table >
                <thead>
                    <tr>
                        <th style={{width: "10%", overflow: "auto"}}>Done</th>
                        <th style={{width: "30%", overflow: "auto"}}>Description</th>
                        <th  style={{width: "10%", overflow: "auto"}}></th>
                    </tr>
                </thead>
                <tbody>
                    {items?.map(item => 
                        <tr className={item.completed ? "completed": "open"} key={item.id}>
                            <td style={{width: "10%", overflow: "auto"}}>
                                <button onClick={() => appContext.toggleStatus(item.completed, item.id)}>
                                {item.completed === true ? <FaCheck/> : <FaCircle/>}
                                </button>
                            </td>
                            <td style={{width: "30%", overflow: "auto"}}>{item.description}</td>                          
                            <td style={{width: "10%", overflow: "auto"}}><button onClick={() => appContext.deleteItem(item.id)}>X</button></td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
            <Add/>
        </div>
        )
    }