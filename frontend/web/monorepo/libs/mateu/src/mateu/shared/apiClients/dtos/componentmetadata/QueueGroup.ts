import QueueItem from "@mateu/shared/apiClients/dtos/componentmetadata/QueueItem";

export default interface QueueGroup {
    label?: string
    items?: QueueItem[]
}
