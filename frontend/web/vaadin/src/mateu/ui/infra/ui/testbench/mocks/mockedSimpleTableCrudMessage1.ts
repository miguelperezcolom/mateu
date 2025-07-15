import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";
import { Page } from "@mateu/shared/apiClients/dtos/Page";


export const mockedSimpleTableCrudMessage1: UIIncrement = {
    fragments:[
        {
            targetComponentId: 'crud1',
            data: {},
            state: {
                page: {
                    pageNumber: 1,
                    pageSize: 10,
                    totalElements: 100,
                    items: [
                        {
                            col1: 'eee',
                            col2: 'fff',
                            col3: 'ggg'
                        },
                        {
                            col1: 'xxxx',
                            col2: 'yyyy',
                            col3: 'zzz'
                        },
                        {
                            col1: '1111',
                            col2: '2222',
                            col3: '3333'
                        }
                    ]
                } as Page
            },
            component: undefined
        }
    ],
    appState: undefined,
    commands: undefined,
    appData: undefined
}