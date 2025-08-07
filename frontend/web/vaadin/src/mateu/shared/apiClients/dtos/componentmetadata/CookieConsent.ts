import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface CookieConsent extends ComponentMetadata {
    position: string
    cookieName: string
    message: string
    theme: string
    learnMore: string
    learnMoreLink: string
    dismiss: string
}