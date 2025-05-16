import Component from "../../../../../shared/apiClients/dtos/Component";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import { ActionType } from "@mateu/shared/apiClients/dtos/componentmetadata/ActionType";
import { ActionStereotype } from "@mateu/shared/apiClients/dtos/componentmetadata/ActionStereotype";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App";


export const mockedSimpleApp1: Component = {
    id: 'app1',
    serverSideType: '',
    metadata: {
        type: ComponentMetadataType.App,
        title: 'My crud',
        subtitle: 'My crud subtitle bla, bla, bla',
        actions: [
            {
                id: 'submit',
                type: ActionType.Secondary,
                stereotype: ActionStereotype.Regular,
                label: 'Enviar',
            }
        ],
    } as App,
    data: {},
    children: []
}