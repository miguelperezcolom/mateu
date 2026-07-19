import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form.ts";

export default interface PageComponent extends Form {

    pageTitle: string
    favicon: string
    /** Page width wire name ("fixed" | "fullWidth" | "edgeToEdge"); absent = the renderer infers it. */
    pageWidth?: string

}