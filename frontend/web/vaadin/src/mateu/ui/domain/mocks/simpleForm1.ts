import Component from "../../../shared/apiClients/dtos/Component";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form";
import Field from "@mateu/shared/apiClients/dtos/componentmetadata/Field";
import { ActionType } from "@mateu/shared/apiClients/dtos/componentmetadata/ActionType";
import { ActionStereotype } from "@mateu/shared/apiClients/dtos/componentmetadata/ActionStereotype";


export const mockedSimpleForm1: Component = {
    id: '_root',
    serverSideType: '',
    metadata: {
        type: ComponentMetadataType.Form,
        title: 'My form',
        subtitle: 'This is the first form, bla, bla, bla, bla, bla...',
        actions: [
            {
                id: 'submit',
                type: ActionType.Secondary,
                stereotype: ActionStereotype.Regular,
                label: 'Enviar',
            }
        ]
    } as Form,
    children: [
        {
            id: '1',
            serverSideType: '',
            metadata: {
                type: ComponentMetadataType.FormLayout,
            },
            children: [
                {
                    id: '2',
                    serverSideType: '',
                    metadata: {
                        fieldId: 'nombre',
                        label: 'Nombre',
                        type: ComponentMetadataType.Field,
                        dataType: 'string',
                        stereotype: 'text'
                    } as Field,
                    children: []
                },
                {
                    id: '3',
                    serverSideType: '',
                    metadata: {
                        fieldId: 'edad',
                        label: 'Edad',
                        type: ComponentMetadataType.Field,
                        dataType: 'integer',
                        stereotype: 'text'
                    } as Field,
                    children: []
                }
            ]
        },
    ]
}