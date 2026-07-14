package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One row of a {@link Ledger}: a {@code concept} on the left and its {@code amount} on the right
 * (negative amounts render in error red). An {@code included} line shows the muted {@code
 * includedLabel} (default {@code "Included"}) instead of an amount and does not count towards the
 * total.
 */
@Builder
public record LedgerLine(String concept, Double amount, boolean included, String includedLabel) {}
