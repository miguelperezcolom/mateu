import Component from "../../../../../shared/apiClients/dtos/Component";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Card from "@mateu/shared/apiClients/dtos/componentmetadata/Card";


export const mockedSimpleCard1: Component = {
    id: 'card1',
    serverSideType: '',
    metadata: {
        type: ComponentMetadataType.Card,
        columns: []
    } as Card,
    initialData: {},
    children: []
}