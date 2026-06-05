package io.mateu.uidl.data;

import java.time.LocalDate;

public record AuditFilters(
        LocalDate dateFrom,
        LocalDate dateTo,
        String action,
        String field,
        String value
) {}
