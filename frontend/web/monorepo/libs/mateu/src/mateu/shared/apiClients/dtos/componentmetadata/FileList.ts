import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import FileItem from "@mateu/shared/apiClients/dtos/componentmetadata/FileItem";

export default interface FileList extends ComponentMetadata {
    files?: FileItem[]
}
