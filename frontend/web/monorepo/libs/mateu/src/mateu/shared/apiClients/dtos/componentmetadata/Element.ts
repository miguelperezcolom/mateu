import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Element extends ComponentMetadata {
    name: string
    content: string
    attributes: Record<string, any>
    on: Record<string, string>
    // When true, `content` is injected as raw HTML (innerHTML) instead of escaped text.
    html?: boolean
}
