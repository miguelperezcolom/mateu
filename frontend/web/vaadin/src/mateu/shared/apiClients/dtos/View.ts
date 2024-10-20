import ViewPart from "./ViewPart";
import {Content} from "./Content";

export default interface View extends Content {

    header: ViewPart
    left: ViewPart
    main: ViewPart
    right: ViewPart
    footer: ViewPart

}
