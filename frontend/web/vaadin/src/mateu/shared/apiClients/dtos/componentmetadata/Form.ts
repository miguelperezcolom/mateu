import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Status from "@mateu/shared/apiClients/dtos/componentmetadata/Status";
import Badge from "@mateu/shared/apiClients/dtos/componentmetadata/Badge";
import { Banner } from "@mateu/shared/apiClients/dtos/componentmetadata/Banner";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import Validation from "@mateu/shared/apiClients/dtos/componentmetadata/Validation";
import Rule from "@mateu/shared/apiClients/dtos/componentmetadata/Rule";
import Trigger from "@mateu/shared/apiClients/dtos/componentmetadata/Trigger";
import { Section } from "@mateu/shared/apiClients/dtos/componentmetadata/Section";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";

export default interface Form extends ComponentMetadata {

    icon: string
    title: string
    readOnly: boolean
    subtitle: string
    status: Status
    badges: Badge[]
    banners: Banner[]
    actions: Action[]
    toolbar: Button[]
    buttons: Button[]
    sections: Section[]
    triggers: Trigger[]
    validations: Validation[]
    rules: Rule[]

}