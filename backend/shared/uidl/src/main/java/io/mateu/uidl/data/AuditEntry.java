package io.mateu.uidl.data;

import io.mateu.uidl.annotations.GroupBy;
import java.time.LocalDateTime;

/**
 * One field-level change of an audited record. The history listing groups entries by {@code when}
 * (every save writes its field changes with the same timestamp), so each group subtotal row reads
 * as ONE VERSION of the record — the audit dialog becomes a version-by-version diff (old → new per
 * field) out of the box.
 */
public record AuditEntry(
    @GroupBy LocalDateTime when,
    String who,
    String action,
    String field,
    String oldValue,
    String newValue) {}
