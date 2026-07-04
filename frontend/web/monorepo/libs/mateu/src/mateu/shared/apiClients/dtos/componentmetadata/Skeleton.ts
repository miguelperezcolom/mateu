import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Skeleton extends ComponentMetadata {

    variant?: 'text' | 'card' | 'grid' | 'form'
    count?: number

}
