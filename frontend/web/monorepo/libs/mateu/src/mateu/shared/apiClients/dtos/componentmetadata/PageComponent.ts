import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component.ts";

export default interface PageComponent extends ComponentMetadata {

    pageTitle: string
    favicon: string
    mainContent: Component

}