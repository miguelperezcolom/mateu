package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One priced extra of an {@link AddOnPicker}: an {@code icon} chip, a {@code title} plus muted
 * {@code description}, a {@code price} with an optional per-{@code unit} suffix (e.g. {@code
 * "estancia"}), or an {@code includedLabel} shown instead of the price (no toggle). {@code added}
 * seeds the toggle state and the running total.
 */
@Builder
public record AddOn(
    String id,
    String icon,
    String title,
    String description,
    Double price,
    String unit,
    String includedLabel,
    boolean added) {}
