import Field from "../../../../../../shared/apiClients/dtos/Field";
import Component from "./section/fieldGroup/field/fields/interfaces/Component";
import {MateuField} from "./section/fieldGroup/field/mateu-field";

export default class FieldWrapper {

    field: Field;

    constructor(field:Field) {
        this.field = field;
    }

    visible: boolean = true;

    enabled: boolean = true;

    container: HTMLElement | undefined = undefined;

    component: Component | undefined = undefined;

    mateuField: MateuField | undefined = undefined

    setVisible(visible: boolean) {
        this.visible = visible;
        this.container?.setAttribute('style', 'display: block;');
        if (this.mateuField) {
            this.mateuField.style.display = this.visible?(this.mateuField.sidePositionedLabel == 'true'?'inline':'block'):'none'
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        try {
            this.component?.setEnabled(this.enabled);
        } catch (e: any) {
            console.log('exception when calling setEnabled()', this, e)
        }
    }
}
