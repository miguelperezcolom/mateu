import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Testimonial from "@mateu/shared/apiClients/dtos/componentmetadata/Testimonial";

export default interface Testimonials extends ComponentMetadata {
    items?: Testimonial[]
}
