package io.mateu.uidl.data;

import java.time.LocalDate;
import lombok.Builder;

@Builder
public record AuditFilters(
    LocalDate dateFrom, LocalDate dateTo, String action, String field, String value) {}
