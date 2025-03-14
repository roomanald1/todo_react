import React from "react";
import { ApplicationState } from "../model/applicationState";

export const ApplicationContext = React.createContext<ApplicationState|undefined>(undefined);
