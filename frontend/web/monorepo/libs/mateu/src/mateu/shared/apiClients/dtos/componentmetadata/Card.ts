import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface Card extends ComponentMetadata {

    title: Component
    subtitle: Component
    media: Component
    headerPrefix: Component
    header: Component
    headerSuffix: Component
    content: Component
    footer: Component
    variants: string[]

}