import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import LedgerLine from "@mateu/shared/apiClients/dtos/componentmetadata/LedgerLine";

export default interface Ledger extends ComponentMetadata {
    currency?: string
    totalLabel?: string
    lines?: LedgerLine[]
    total?: number
}
