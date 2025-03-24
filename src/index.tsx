import ReactDOM from 'react-dom/client';
import {App} from './components/App';
import './style.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Login } from './components/Login';
import { ApplicationContext, UserContext } from "./components/ApplicationContext";
import { useObservable } from "./utils/useObservable";
import { ApplicationState } from "./model/applicationState";
import { useMemo } from 'react';
import { map } from 'rxjs';
import { initialiseNotifications } from './utils/notifications';
import { UserModel } from './model/userModel';

const clientId = "679057157657-p3do263k151dc2e813mjeloejetgjshv.apps.googleusercontent.com"

export const Bootstrap = () => {

  const userState = useMemo(() => new UserModel(), []);
  const state = useMemo(() => new ApplicationState(userState), [userState]);

  const isLoggedIn = useObservable(() => state.user().getUser$().pipe(map(user => user !== undefined)));

  return <GoogleOAuthProvider clientId={clientId}>
    <UserContext.Provider value={userState}>
          {!isLoggedIn && <Login />}
          <ApplicationContext.Provider value={state}>
            {isLoggedIn && <App/>}
          </ApplicationContext.Provider>
    </UserContext.Provider>
  </GoogleOAuthProvider>
}

initialiseNotifications();

ReactDOM
  .createRoot(document.getElementById('app') as HTMLElement)
    .render(<Bootstrap/>);

