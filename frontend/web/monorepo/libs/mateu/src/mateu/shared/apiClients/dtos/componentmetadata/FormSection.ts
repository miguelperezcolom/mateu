import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Status from "@mateu/shared/apiClients/dtos/componentmetadata/Status";
import Badge from "@mateu/shared/apiClients/dtos/componentmetadata/Badge";
import { Banner } from "@mateu/shared/apiClients/dtos/componentmetadata/Banner";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";

export default interface FormSection extends ComponentMetadata {

    icon: string
    title: string
    subtitle: string
    status: Status
    badges: Badge[]
    banners: Banner[]
    toolbar: Button[]

}