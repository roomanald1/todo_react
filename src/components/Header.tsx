import { useContext } from "react";
import { ApplicationContext, UserContext } from "./ApplicationContext";
import { useObservable } from "../utils/useObservable";
import { googleLogout } from "@react-oauth/google";
import { Filter } from "./Filter";
import { FaRedo } from "react-icons/fa";

export const Header = () => {

    const appContext = useContext(ApplicationContext);
    const userContext = useContext(UserContext);

    const errors = useObservable(() => appContext?.getErrors$());

    const user = useObservable(() => userContext?.getUser$());
    const isLoading = useObservable(() => appContext?.getIsLoading$());

    return ( <>
        <div style={{display: "flex", marginBottom: 5}}>
            <button onClick={() => {
                googleLogout();
                appContext?.logout();
            }}>Log Out</button>
            <div style={{flex: 1}}/>
            <span style={{placeContent: "center", marginRight: 20}}>{user?.given_name}</span>
        </div>
        {errors && <span>{errors}</span>}
            <div style={{ display: "flex", marginBottom: 10 }}>
                <div style={{ flex: 1 }} />
                <button onClick={() => appContext?.refresh()}><FaRedo className={isLoading ? "spin" : ""} /></button>
            </div>

    </>)
}