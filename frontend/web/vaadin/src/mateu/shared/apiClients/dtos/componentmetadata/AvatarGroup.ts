import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Avatar from "@mateu/shared/apiClients/dtos/componentmetadata/Avatar";

export default interface AvatarGroup extends ComponentMetadata {

    avatars: Avatar[]
    maxItemsVisible: number

}