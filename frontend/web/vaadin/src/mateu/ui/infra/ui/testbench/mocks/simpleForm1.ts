import Component from "../../../../../shared/apiClients/dtos/Component";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form";
import { ActionType } from "@mateu/shared/apiClients/dtos/componentmetadata/ActionType";
import { ActionStereotype } from "@mateu/shared/apiClients/dtos/componentmetadata/ActionStereotype";


export const mockedSimpleForm1: Component = {
    id: '_root',
    serverSideType: '',
    metadata: {
        type: ComponentMetadataType.Form,
        title: 'My form',
        subtitle: 'This is the first form, bla, bla, bla, bla, bla...',
        sections: [
            {
                groups: [
                    {
                        fields: [
                            {
                                fieldId: 'nombre',
                                label: 'Nombre',
                                dataType: 'string',
                                stereotype: 'text',
                                initialValue: 'Mateu'
                            },
                            {
                                fieldId: 'edad',
                                label: 'Edad',
                                dataType: 'integer',
                                stereotype: 'text',
                                initialValue: 17
                            },
                            {
                                fieldId: 'poblacion',
                                label: 'Población',
                                dataType: 'string',
                                stereotype: 'text'
                            },
                            {
                                fieldId: 'idioma',
                                label: 'Idioma',
                                dataType: 'string',
                                stereotype: 'text'
                            }
                        ]
                    }
                ]
            }
        ],
        actions: [
            {
                id: 'submit',
                type: ActionType.Secondary,
                stereotype: ActionStereotype.Regular,
                label: 'Enviar',
            }
        ]
    } as Form,
    initialData: {},
    children: [

    ]
}