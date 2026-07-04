import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

// Slotted content travels as the component's children
export default interface HeroSection extends ComponentMetadata {

    title?: string
    subtitle?: string
    image?: string
    height?: string
    centered?: boolean

}
