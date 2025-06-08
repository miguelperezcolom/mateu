import Component from "../../../../../shared/apiClients/dtos/Component";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import { ButtonType } from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonType";
import { ButtonStereotype } from "@mateu/shared/apiClients/dtos/componentmetadata/ButtonStereotype";


export const mockedSimpleCardCrud1: Component = {
    id: 'crud1',
    serverSideType: '',
    metadata: {
        type: ComponentMetadataType.CardCrud,
        title: 'My crud',
        subtitle: 'My crud subtitle bla, bla, bla',
        searchable: true,
        filters: [
            {
                fieldId: 'nombre',
                label: 'Nombre',
                dataType: 'string',
                stereotype: 'text'
            },
            {
                fieldId: 'edad',
                label: 'Edad',
                dataType: 'integer',
                stereotype: 'text'
            },
        ],
        actions: [
            {
                id: 'submit',
                type: ButtonType.Secondary,
                stereotype: ButtonStereotype.Regular,
                label: 'Enviar',
            }
        ],
        table: {
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
        pageSize: 10,
        clientSidePagination: false
    } as Crud,
    initialData: {},
    children: []
}