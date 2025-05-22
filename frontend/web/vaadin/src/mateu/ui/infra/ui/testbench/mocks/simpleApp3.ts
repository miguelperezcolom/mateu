import Component from "../../../../../shared/apiClients/dtos/Component";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant";


export const mockedSimpleApp3: Component = {
    id: 'app1',
    serverSideType: '',
    metadata: {
        type: ComponentMetadataType.App,
        variant: AppVariant.TABS,
        title: 'My app',
        subtitle: 'My app subtitle bla, bla, bla',
        menu: [
            {
                destination: {
                    route: 'journey1',
                    target: 'top'
                },
                label: 'Opción 1',
            },
            {
                destination: {
                    route: 'journey2',
                    target: 'top'
                },
                label: 'Opción 2',
                children: [
                    {
                        destination: {
                            route: 'journey5',
                            target: 'top'
                        },
                        label: 'Opción 5',
                        selected: true
                    },
                    {
                        destination: {
                            route: 'journey6',
                            target: 'top'
                        },
                        label: 'Opción 6',
                    },
                ]
            },
            {
                destination: {
                    route: 'journey3',
                    target: 'top'
                },
                label: 'Opción 3',
            }
        ],
    } as App,
    initialData: {},
    children: []
}