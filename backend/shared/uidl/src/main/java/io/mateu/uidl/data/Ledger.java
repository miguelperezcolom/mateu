package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A folio/invoice breakdown with a total: {@code lines} ({@link LedgerLine}) rendered as
 * concept-left, monospace-amount-right rows (negative amounts in error red, included lines show
 * their label instead of an amount), then a divider and the {@code totalLabel} with the big {@code
 * total} ({@code null} → the client computes the sum of non-included amounts). Amounts are
 * formatted client-side with the {@code currency} symbol. Read-only, no actions. Design-system
 * neutral, dark-mode aware.
 */
@Builder
public record Ledger(
    String id,
    String currency,
    String totalLabel,
    List<LedgerLine> lines,
    Double total,
    String style,
    String cssClasses)
    implements Component {}
