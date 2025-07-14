import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MessageList from "@mateu/shared/apiClients/dtos/componentmetadata/MessageList";
import { html } from "lit";

export const renderMessageList = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as MessageList
    return html`
        <vaadin-message-list
                style="${component.style}" class="${component.cssClasses}"
                .items="${[
        {
            text: '**Hello team!** Did everyone review the *design document* for the new project?',
            userName: 'Alex Johnson',
        },
        {
            text: `## Project Update
I've completed the initial research phase and documented my findings.

* UI mockups ✅
* Market analysis ✅
* [See detailed report](https://vaadin.com)

Let me know your thoughts!`,
            userName: 'Sam Rivera',
        },
    ]
    }"
        ></vaadin-message-list>
    `
}
