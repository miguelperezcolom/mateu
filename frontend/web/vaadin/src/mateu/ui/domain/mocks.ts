import Component from "../../shared/apiClients/dtos/Component";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";

export const mockedRoot: Component = {
    id: '_root',
    metadata: {
        type: ComponentMetadataType.Element,
        name: 'div'
    } as Element,
    children: [
        {
            id: '1',
            metadata: {
                type: ComponentMetadataType.Element,
                name: 'div'
            } as Element,
            children: [
                {
                    id: '2',
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
            metadata: {
                type: ComponentMetadataType.Element,
                name: 'div',
            } as Element,
            children: [
                {
                    id: '4',
                    metadata: {
                        type: ComponentMetadataType.Element,
                        name: 'div',
                        content: 'Hola!'
                    } as Element,
                    children: []
                }
            ]
        }
    ]
}

export const mockedNewRoot: Component = {
    id: '_root',
    metadata: {
        type: ComponentMetadataType.HorizontalLayout,
        name: 'div'
    } as Element,
    children: [
        {
            id: '1',
            metadata: {
                type: ComponentMetadataType.Element,
                name: 'div'
            } as Element,
            children: [
                {
                    id: '2',
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
            metadata: {
                type: ComponentMetadataType.Element,
                name: 'div',
            } as Element,
            children: [
                {
                    id: '6',
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