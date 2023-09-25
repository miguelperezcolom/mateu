import ValueChangedEvent from "./ValueChangedEvent";
import Field from "../../../../../../../../../../../../shared/apiClients/dtos/Field";

export default interface Component {

    onValueChanged(event: ValueChangedEvent):void;

    setBaseUrl(value: string): void;

    setLabel(value: string): void;

    setPlaceholder(value: string): void;

    setPattern(value: string): void;

    setValue(value: unknown): void;

    setEnabled(enabled: boolean): void;

    setField(field: Field): void;

    setRequired(required: boolean): void;

}
