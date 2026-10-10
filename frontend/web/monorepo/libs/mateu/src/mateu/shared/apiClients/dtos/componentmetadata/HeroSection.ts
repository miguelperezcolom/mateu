import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

// Slotted content travels as the component's children
export default interface HeroSection extends ComponentMetadata {

    title?: string
    subtitle?: string
    image?: string
    height?: string
    centered?: boolean
    /**
     * The band's tone: ocean | pine | lilac | teal | rose | pebble | slate | plum | sienna — a dark
     * tinted band with light ink; absent = the default look.
     */
    tone?: string

}
