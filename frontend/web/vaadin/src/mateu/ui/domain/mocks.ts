import Component from "../../shared/apiClients/dtos/Component";

export const mockedRoot: Component = {
    id: '_root',
    type: 'hl',
    children: [
        {
            id: '1',
            type: 'div',
            children: [
                {
                    id: '2',
                    type: 'text',
                    children: []
                }
            ]
        },
        {
            id: '3',
            type: 'div',
            children: [
                {
                    id: '4',
                    type: 'text',
                    children: []
                }
            ]
        }
    ]
}

export const mockedNewRoot: Component = {
    id: '_root',
    type: 'hl',
    children: [
        {
            id: '1',
            type: 'div',
            children: [
                {
                    id: '2',
                    type: 'text',
                    children: []
                }
            ]
        },
        {
            id: '3',
            type: 'div',
            children: [
                {
                    id: '6',
                    type: 'text',
                    children: []
                }
            ]
        }
    ]
}