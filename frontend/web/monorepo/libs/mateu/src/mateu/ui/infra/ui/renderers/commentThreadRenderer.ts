import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import CommentThread from "@mateu/shared/apiClients/dtos/componentmetadata/CommentThread";
import { html, nothing } from "lit";
import "@infra/ui/mateu-comment-thread.ts";

export const renderCommentThread = (component: ClientSideComponent) => {
    const metadata = component.metadata as CommentThread
    return html`
        <mateu-comment-thread
                .comments="${metadata.comments ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-comment-thread>
    `
}
