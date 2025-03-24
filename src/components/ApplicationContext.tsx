import React from "react";
import { ApplicationState } from "../model/applicationState";
import { UserModel } from "../model/userModel";
import { FilterModel } from "src/model/filterModel";

export const ApplicationContext = React.createContext<ApplicationState|undefined>(undefined);


export const UserContext = React.createContext<UserModel|undefined>(undefined);

export const FilterContext = React.createContext<FilterModel|undefined>(undefined);