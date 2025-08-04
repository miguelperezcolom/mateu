import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

interface Breadcrumb {

    text: string
    link: string | undefined

}

export default interface Breadcrumbs extends ComponentMetadata {

    currentItemText: string
    breadcrumbs: Breadcrumb[]

}
