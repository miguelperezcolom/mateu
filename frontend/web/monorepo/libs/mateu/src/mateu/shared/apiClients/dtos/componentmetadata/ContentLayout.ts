import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

// Region contents travel as slotted children: main-N, aside-N, footer-N
export default interface ContentLayout extends ComponentMetadata {

    asidePosition?: string // "start" | "end"

    asideWidth?: string

    asideSticky?: boolean

}
