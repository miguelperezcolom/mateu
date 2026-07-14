import Chip from "@mateu/shared/apiClients/dtos/componentmetadata/Chip";

export default interface QueueItem {
    id?: string
    title?: string
    caption?: string
    badges?: Chip[]
    selected?: boolean
}
