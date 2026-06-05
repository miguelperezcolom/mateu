package io.mateu.uidl.data;

import java.time.LocalDateTime;

public record AuditEntry(
        LocalDateTime when,
        String who,
        String action,
        String field,
        String oldValue,
        String newValue
) {}
