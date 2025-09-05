import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Status from "@mateu/shared/apiClients/dtos/componentmetadata/Status";
import Badge from "@mateu/shared/apiClients/dtos/componentmetadata/Badge";
import { Banner } from "@mateu/shared/apiClients/dtos/componentmetadata/Banner";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import Component from "@mateu/shared/apiClients/dtos/Component.ts";

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
    header: Component[]
    footer: Component[]

}