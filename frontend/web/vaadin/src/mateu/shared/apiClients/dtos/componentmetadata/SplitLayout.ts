import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export enum SplitLayoutOrientation {
    horizontal = "horizontal",
    vertical = "vertical"
}

export enum SplitLayoutVariant {
    small = "small",
    minimal = "minimal"
}

export default interface SplitLayout extends ComponentMetadata {

    orientation: SplitLayoutOrientation | undefined
    variant: SplitLayoutVariant | undefined

}
