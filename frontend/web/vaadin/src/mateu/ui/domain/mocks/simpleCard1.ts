import Component from "../../../shared/apiClients/dtos/Component";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Card from "@mateu/shared/apiClients/dtos/componentmetadata/Card";


export const mockedSimpleCard1: Component = {
    id: '_root',
    serverSideType: '',
    metadata: {
        id: 'card1',
        type: ComponentMetadataType.Card,
        columns: []
    } as Card,
    children: []
}