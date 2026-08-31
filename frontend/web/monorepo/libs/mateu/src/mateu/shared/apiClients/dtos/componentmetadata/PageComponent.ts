import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form.ts";

export default interface PageComponent extends Form {

    pageTitle: string
    favicon: string
    /** The small line of text shown ABOVE the title (Redwood's overlineText). */
    overline?: string
    /**
     * What the header shows while `title` is still empty (Redwood's pageTitlePlaceholder) — the
     * create-mode affordance. A placeholder, NOT a default: ignore it once a title exists.
     */
    titlePlaceholder?: string
    /** Page width wire name ("fixed" | "fullWidth" | "edgeToEdge"); absent = the renderer infers it. */
    pageWidth?: string
    /** Coarse page type ("landing" | "collection" | "detail" | "form" | "process" | "dashboard"). */
    pageType?: string

}