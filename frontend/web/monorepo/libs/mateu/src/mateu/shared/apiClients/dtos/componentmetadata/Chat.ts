import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Chat extends ComponentMetadata {

    sseUrl: string
    uploadUrl?: string

}