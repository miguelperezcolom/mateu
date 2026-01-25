import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Status from "@mateu/shared/apiClients/dtos/componentmetadata/Status";
import Badge from "@mateu/shared/apiClients/dtos/componentmetadata/Badge";
import { Banner } from "@mateu/shared/apiClients/dtos/componentmetadata/Banner";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import Component from "@mateu/shared/apiClients/dtos/Component.ts";
import KPI from "@mateu/shared/apiClients/dtos/componentmetadata/KPI.ts";

export default interface Form extends ComponentMetadata {

    icon: string
    title: string
    readOnly: boolean
    subtitle: string
    noHeader: boolean
    status: Status
    badges: Badge[]
    kpis: KPI[]
    banners: Banner[]
    actions: Action[]
    toolbar: Button[]
    buttons: Button[]
    avatar: Component
    header: Component[]
    footer: Component[]

}