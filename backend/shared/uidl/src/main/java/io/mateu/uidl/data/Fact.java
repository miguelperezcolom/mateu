package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One key fact of an {@link EntityHeader}: a small-caps {@code label} over its {@code value} (e.g.
 * {@code "TOTAL RESERVA"} / {@code "€ 4.890,00"}).
 */
@Builder
public record Fact(String label, String value) {}
