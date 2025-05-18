import Component from "../../../../../shared/apiClients/dtos/Component";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant";


export const mockedSimpleApp2: Component = {
    id: 'app1',
    serverSideType: '',
    metadata: {
        type: ComponentMetadataType.App,
        variant: AppVariant.MENU_ON_LEFT,
        title: 'My app',
        subtitle: 'My app subtitle bla, bla, bla',
        options: [
            {
                route: 'journey1',
                label: 'Opción 1',
            },
            {
                route: 'journey2',
                label: 'Opción 2',
                children: [
                    {
                        route: 'journey5',
                        label: 'Opción 5',
                        selected: true
                    },
                    {
                        route: 'journey6',
                        label: 'Opción 6',
                    },
                ]
            },
            {
                route: 'journey3',
                label: 'Opción 3',
            }
        ],
    } as App,
    initialData: {},
    children: []
}