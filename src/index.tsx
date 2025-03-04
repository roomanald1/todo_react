import ReactDOM from 'react-dom/client';
import {App} from './components/App';
import './style.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Login } from './components/Login';
import { ApplicationContext } from "./components/ApplicationContext";
import { useObservable } from "./utils/useObservable";
import { ApplicationState } from "./model/ApplicationState";
import { useMemo } from 'react';
import { map } from 'rxjs';

const clientId = "679057157657-p3do263k151dc2e813mjeloejetgjshv.apps.googleusercontent.com"

export const Bootstrap = () => {

  const state = useMemo(() => new ApplicationState(), []);

  const isLoggedIn = useObservable(state.getUser$().pipe(map(user => user !== undefined)), false);

  return <GoogleOAuthProvider clientId={clientId}>
    <ApplicationContext.Provider value={state}>
        {!isLoggedIn && <Login />}
        {isLoggedIn && <App/>}
    </ApplicationContext.Provider>
  </GoogleOAuthProvider>
}

ReactDOM
  .createRoot(document.getElementById('app') as HTMLElement)
    .render(<Bootstrap/>);

