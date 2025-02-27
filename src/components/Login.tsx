import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";
export const Login = () => {

    const appContext = useContext(ApplicationContext);
    
    return <GoogleLogin
        onSuccess={credentialResponse => {
            const decoded = jwtDecode(credentialResponse.credential ?? "");
            appContext.setUser(decoded);
        }}
        onError={() => {
            console.log('Login Failed');
        }}/>;
}



