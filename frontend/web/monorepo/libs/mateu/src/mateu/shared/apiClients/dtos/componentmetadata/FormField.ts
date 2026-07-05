import Validation from "./Validation";
import Badge from "./Badge";
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import RemoteCoordinates from "@mateu/shared/apiClients/dtos/componentmetadata/RemoteCoordinates.ts";
import NavLink from "@mateu/shared/apiClients/dtos/componentmetadata/NavLink.ts";

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
    colspan?: number | undefined
    rightAligned?: boolean | undefined
    bold?: boolean | undefined
    initialValue?: unknown
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
    onItemSelectionActionId: string | undefined
    rowSelectionShortcut: string | undefined
    inlineEditing: boolean
    formPosition: string
    formStyle: string
    formTheme: string
    formColumns: number
    sliderMin: number
    sliderMax: number
    stepButtonsVisible: boolean
    step: number
    min?: number | undefined
    max?: number | undefined
    itemIdPath: string | undefined
    detailPath: string
    useButtonForDetail: boolean
    minHeightWhenDetailVisible: string
    optionsColumns: number
    mainFilter?: boolean
    multiline?: boolean
    link?: NavLink | undefined

}
