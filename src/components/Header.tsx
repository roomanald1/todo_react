import { useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";
import { useObservable } from "../utils/useObservable";
import { googleLogout } from "@react-oauth/google";
import { Filter } from "./Filter";

export const Header = () => {

    const appContext = useContext(ApplicationContext);

    const user = useObservable(appContext.getUser$(), undefined);

    return ( <>
        <div style={{display: "flex"}}>
            <button onClick={() => {
                googleLogout();
                appContext.logout();
            }}>Log Out</button>
            <div style={{flex: 1}}/>
            <Filter/>
        </div>
        <h1 style={{textAlign: "center"}}>{user?.given_name}'s TODOs</h1>
    </>)
}