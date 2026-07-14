import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Comment from "@mateu/shared/apiClients/dtos/componentmetadata/Comment";

export default interface CommentThread extends ComponentMetadata {
    comments?: Comment[]
}
