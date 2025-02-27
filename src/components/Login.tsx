import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { ApplicationContext } from "./ApplicationContext";
import axios from "axios";
export const Login = () => {

    const appContext = useContext(ApplicationContext);
    const login = useGoogleLogin({
        onSuccess: async credentialResponse => {
            console.log(credentialResponse);

            const userInfo = await axios.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                { headers: { Authorization: `Bearer ${credentialResponse.access_token}` } },
            );
        
            console.log(userInfo);
            appContext.setUser(userInfo.data)
            },
        onError: errorResponse => console.log(errorResponse),
    });
    return <button onClick={() => login()}>Login</button>;
}



