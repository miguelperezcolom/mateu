import Component from "./Component";
import {SortCriteria} from "./SortCriteria";

export interface CrudComponent extends Component {

    lastUsedFilters: Map<string, unknown>
    lastUsedSorting: SortCriteria[]

}