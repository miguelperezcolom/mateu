import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import MessageListItem from "@mateu/shared/apiClients/dtos/componentmetadata/MessageListItem";

export default interface MessageList extends ComponentMetadata {
    items: MessageListItem[]
}
