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
                journeyTypeId: 'journey1',
                label: 'Opción 1',
            },
            {
                journeyTypeId: 'journey2',
                label: 'Opción 2',
                children: [
                    {
                        journeyTypeId: 'journey5',
                        label: 'Opción 5',
                        selected: true
                    },
                    {
                        journeyTypeId: 'journey6',
                        label: 'Opción 6',
                    },
                ]
            },
            {
                journeyTypeId: 'journey3',
                label: 'Opción 3',
            }
        ],
    } as App,
    initialData: {},
    children: []
}