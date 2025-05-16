import Component from "../../../../../shared/apiClients/dtos/Component";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";

export const mockedSimpleRoot1: Component = {
    id: '_root',
    serverSideType: '',
    metadata: {
        type: ComponentMetadataType.Element,
        name: 'div'
    } as Element,
    data: {},
    children: [
        {
            id: '1',
            serverSideType: '',
            metadata: {
                type: ComponentMetadataType.Element,
                name: 'div'
            } as Element,
            data: {},
            children: [
                {
                    id: '2',
                    serverSideType: '',
                    metadata: {
                        type: ComponentMetadataType.Element,
                        name: 'div'
                    } as Element,
                    data: {},
                    children: []
                }
            ]
        },
        {
            id: '3',
            serverSideType: '',
            metadata: {
                type: ComponentMetadataType.Element,
                name: 'div',
            } as Element,
            data: {},
            children: [
                {
                    id: '4',
                    serverSideType: '',
                    metadata: {
                        type: ComponentMetadataType.Element,
                        name: 'div',
                        content: 'Hola!'
                    } as Element,
                    data: {},
                    children: []
                }
            ]
        }
    ]
}
