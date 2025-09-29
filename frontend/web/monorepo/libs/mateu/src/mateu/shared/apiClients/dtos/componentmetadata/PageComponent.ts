import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form.ts";

export default interface PageComponent extends Form {

    pageTitle: string
    favicon: string

}