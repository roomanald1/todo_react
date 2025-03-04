import React from "react";
import { ApplicationState } from "../model/ApplicationState";

export const ApplicationContext = React.createContext<ApplicationState>(new ApplicationState());
