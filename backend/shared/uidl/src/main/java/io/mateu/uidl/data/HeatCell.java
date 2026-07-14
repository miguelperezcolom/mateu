package io.mateu.uidl.data;

import java.time.LocalDate;
import lombok.Builder;

/**
 * One cell of a {@link Heatmap}: a {@code date} and its {@code value} (drives the color intensity);
 * {@code label} is an optional tooltip override.
 */
@Builder
public record HeatCell(LocalDate date, double value, String label) {}
