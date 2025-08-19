import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export enum AccordionLayoutVariant {
    reverse = "reverse",
    filled = "filled",
    small = "small",
}

export default interface AccordionLayout extends ComponentMetadata {

    variant: AccordionLayoutVariant | undefined
    fullWidth: boolean

}
