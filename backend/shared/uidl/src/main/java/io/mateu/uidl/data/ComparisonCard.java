package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A side-by-side comparison of two values (e.g. two periods, plans or options): a {@code title}, a
 * left and right label+value, and a {@code delta} with a {@code trend} ({@code "up"} / {@code
 * "down"} / {@code "flat"}) between them. Design-system neutral, dark-mode aware.
 */
@Builder
public record ComparisonCard(
    String id,
    String title,
    String leftLabel,
    String leftValue,
    String rightLabel,
    String rightValue,
    String delta,
    String trend,
    String style,
    String cssClasses)
    implements Component {}
