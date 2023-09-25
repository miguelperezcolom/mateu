import {Subject} from "rxjs";
import {CrudState} from "./crudstate";

export const crudUpstream = new Subject<CrudState>()