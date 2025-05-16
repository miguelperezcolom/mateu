import Component from "../../../shared/apiClients/dtos/Component";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import { ActionType } from "@mateu/shared/apiClients/dtos/componentmetadata/ActionType";
import { ActionStereotype } from "@mateu/shared/apiClients/dtos/componentmetadata/ActionStereotype";


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
                type: ComponentMetadataType.Field,
                dataType: 'string',
                stereotype: 'text'
            },
            {
                fieldId: 'edad',
                label: 'Edad',
                type: ComponentMetadataType.Field,
                dataType: 'integer',
                stereotype: 'text'
            },
        ],
        actions: [
            {
                id: 'submit',
                type: ActionType.Secondary,
                stereotype: ActionStereotype.Regular,
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
    data: {},
    children: []
}