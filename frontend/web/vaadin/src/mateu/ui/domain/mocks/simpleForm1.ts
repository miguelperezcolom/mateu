import Component from "../../../shared/apiClients/dtos/Component";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";


export const mockedSimpleForm1: Component = {
    id: '_root',
    serverSideType: '',
    metadata: {
        type: ComponentMetadataType.HorizontalLayout,
        name: 'div'
    } as Element,
    children: [
        {
            id: '1',
            serverSideType: '',
            metadata: {
                type: ComponentMetadataType.Element,
                name: 'div'
            } as Element,
            children: [
                {
                    id: '2',
                    serverSideType: '',
                    metadata: {
                        type: ComponentMetadataType.Element,
                        name: 'div'
                    } as Element,
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
            children: [
                {
                    id: '6',
                    serverSideType: '',
                    metadata: {
                        type: ComponentMetadataType.Element,
                        name: 'div',
                        content: 'Hola 6!'
                    } as Element,
                    children: []
                }
            ]
        }
    ]
}