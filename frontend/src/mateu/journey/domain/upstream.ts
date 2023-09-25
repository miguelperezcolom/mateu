import {Subject} from "rxjs";
import {State} from "./state";

export const upstream = new Subject<State>()