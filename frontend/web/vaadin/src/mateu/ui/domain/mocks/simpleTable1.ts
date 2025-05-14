import Component from "../../../shared/apiClients/dtos/Component";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";


export const mockedSimpleTable1: Component = {
    id: '_root',
    serverSideType: '',
    metadata: {
        id: 'table1',
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
    children: []
}