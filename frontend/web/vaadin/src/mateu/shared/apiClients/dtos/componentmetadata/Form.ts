import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Status from "@mateu/shared/apiClients/dtos/componentmetadata/Status";
import Badge from "@mateu/shared/apiClients/dtos/componentmetadata/Badge";
import { Banner } from "@mateu/shared/apiClients/dtos/componentmetadata/Banner";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import Validation from "@mateu/shared/apiClients/dtos/componentmetadata/Validation";
import Rule from "@mateu/shared/apiClients/dtos/componentmetadata/Rule";
import Section from "@mateu/shared/apiClients/dtos/componentmetadata/Section";

export default interface Form extends ComponentMetadata {

    icon: string
    title: string
    readOnly: boolean
    subtitle: string
    status: Status
    badges: Badge[]
    banners: Banner[]
    sections: Section[]
    actions: Action[]
    mainActions: Action[]
    validations: Validation[]
    rules: Rule[]

}