import FieldGroupLine from "./FieldGroupLine";

export default interface FieldGroup {

    id: string;

    caption: string;

    lines: FieldGroupLine[];
}
