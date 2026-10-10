import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export interface MatrixColumn { id: string, label?: string, group?: string | null, tone?: string | null }
export interface MatrixCell { value?: string, tone?: string | null, link?: boolean }
export interface MatrixRow { id: string, label?: string, cells?: MatrixCell[], editable?: boolean, emphasis?: boolean }
export interface MatrixSection { id: string, title?: string | null, collapsed?: boolean, rows?: MatrixRow[] }

export default interface MatrixGrid extends ComponentMetadata {
    rowHeaderLabel?: string | null
    columns?: MatrixColumn[]
    sections?: MatrixSection[]
    cellActionId?: string | null
    editActionId?: string | null
}
