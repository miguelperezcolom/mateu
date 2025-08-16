import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import { property } from "lit/decorators.js";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import { ValidateMixinClass } from "@vaadin/field-base/src/validate-mixin";

export default abstract class ComponentElement extends MetadataDrivenElement {

    // public properties
    @property()
    state: Record<string, any> = {}

    @property()
    data: Record<string, any> = {}


    // write state to reactive properties
    applyFragment(fragment: UIFragment) {
        if (this.id == fragment.targetComponentId) {
            if (fragment.component) {
                const children = fragment.component?.type == ComponentType.ServerSide?
                    fragment.component?.children:
                    [fragment.component]
                this.component!.children = children
            }

            if (fragment.state) {
                this.state = { ...this.state, ...fragment.state }
            }

            if (fragment.data) {
                this.data = { ...this.data, ...fragment.data }
            }

            this.requestUpdate()
        }
    }

    validate(): boolean {
        // mirar validaciones
        const allFields: NodeListOf<any>[] = []
        const allMateuFields = this.renderRoot?.querySelectorAll('mateu-field')
        allMateuFields.forEach(field => allFields.push(field.renderRoot.querySelectorAll('vaadin-text-field,vaadin-integer-field')))
        let allValid = true
        allFields.forEach(nodelist => {
            nodelist.forEach(item => {
                const valid = (item as ValidateMixinClass).validate()
                allValid &&= valid
            })
        })
        // limpiar errores
        // comprobar y generar errores
        // devolver false si hay errores
        return allValid
    }

}