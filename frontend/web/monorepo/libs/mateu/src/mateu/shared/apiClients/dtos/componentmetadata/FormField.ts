import Validation from "./Validation";
import Pair from "./Pair";
import Badge from "./Badge";
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import RemoteCoordinates from "@mateu/shared/apiClients/dtos/componentmetadata/RemoteCoordinates.ts";

export default interface FormField extends ComponentMetadata {

    fieldId: string
    dataType: string
    stereotype: string
    observed?: boolean | undefined
    wantsFocus?: boolean | undefined
    label: string | undefined
    placeholder?: string | undefined
    cssClasses?: string | undefined
    description?: string | undefined
    badges?: Badge[] | undefined
    validations?: Validation[] | undefined
    attributes?: Pair[] | undefined
    colspan?: number | undefined
    rightAligned?: boolean | undefined
    bold?: boolean | undefined
    initialValue?: any
    options?: Option[] | undefined
    remoteCoordinates: RemoteCoordinates | undefined
    charLimit?: string
    required: boolean
    disabled: boolean
    readOnly: boolean
    style?: string | undefined
    columns: ClientSideComponent[]
    createForm: ClientSideComponent
    editor: ClientSideComponent

}
