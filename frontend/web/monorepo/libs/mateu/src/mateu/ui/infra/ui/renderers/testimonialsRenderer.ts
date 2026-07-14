import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Testimonials from "@mateu/shared/apiClients/dtos/componentmetadata/Testimonials";
import { html, nothing } from "lit";
import "@infra/ui/mateu-testimonials.ts";

export const renderTestimonials = (component: ClientSideComponent) => {
    const metadata = component.metadata as Testimonials
    return html`
        <mateu-testimonials
                .items="${metadata.items ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-testimonials>
    `
}
