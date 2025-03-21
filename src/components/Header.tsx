import { useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";
import { useObservable } from "../utils/useObservable";
import { googleLogout } from "@react-oauth/google";
import { Filter } from "./Filter";

export const Header = () => {

    const appContext = useContext(ApplicationContext);

    const user = useObservable(() => appContext?.user().getUser$());
    const today = useObservable(() => appContext?.filter().getToday$());
    return ( <>
        <div style={{display: "flex", marginBottom: 5}}>
            <button onClick={() => {
                googleLogout();
                appContext?.logout();
            }}>Log Out</button>
            <div style={{flex: 1}}/>
            <span style={{placeContent: "center", marginRight: 20}}>{user?.given_name}</span>
            <button style={{marginRight: 20}} onClick={() => appContext?.filter().toggleToday()}>{today ? "Today" : "All"}</button>
            <Filter/>
        </div>

    </>)
}