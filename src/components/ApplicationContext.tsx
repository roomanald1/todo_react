import React from "react";
import { ApplicationState } from "./ApplicationState";





export const ApplicationContext = React.createContext<ApplicationState>(new ApplicationState());
