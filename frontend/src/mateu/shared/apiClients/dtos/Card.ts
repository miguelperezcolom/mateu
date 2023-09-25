import ViewMetadata from "./ViewMetadata";
import FieldGroup from "./FieldGroup";

export default interface Card extends ViewMetadata {

    dataPrefix: string

    title: string;

    subtitle: string;

    icon: string;

    info: string;

    total: string;

    fieldGroups: FieldGroup[];

}
