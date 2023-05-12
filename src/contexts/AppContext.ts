import {Context, createContext} from "react";
import IAppContext from "@interfaces/IAppContext.ts";

export const AppContext: Context<IAppContext> = createContext({});
