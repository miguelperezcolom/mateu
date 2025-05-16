import Component from "../../../../../shared/apiClients/dtos/Component";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";


export const mockedSimpleTable1: Component = {
    id: 'table1',
    serverSideType: '',
    metadata: {
        type: ComponentMetadataType.Table,
        columns: [
            {
                id: 'col1',
                header: 'Header 1'
            },
            {
                id: 'col2',
                header: 'Header 2'
            },
            {
                id: 'col3',
                header: 'Header 3'
            }
        ],
        rows: undefined,
    } as Table,
    initialData: {
        items: [
            {
                col1: 'aaa',
                col2: 'bbb',
                col3: 'cccc'
            },
            {
                col1: 'xxxx',
                col2: 'yyyy',
                col3: 'zzz'
            }
        ]
    },
    children: []
}