import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface TabLayout extends ComponentMetadata {

    fullWidth: boolean

    orientation: string | undefined
    variant: string | undefined
}
