import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

interface CardImage {
}

interface CardContent {
}

export default interface Card extends ComponentMetadata {

    title: string
    subtitle: string
    image: CardImage
    headerPrefix: string
    header: string
    headerSuffix: string
    content: CardContent
    footer: string

}