package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * Consumption against a limit (e.g. balance vs preauthorization): a small-caps {@code label}, the
 * formatted {@code value} big with the {@code unit} symbol appended, a progress track filled to
 * {@code value/max}, and a muted {@code caption} (absent → the computed fill percent). The fill
 * turns warning at {@code warnAt} and error at {@code dangerAt} (both optional; absent → primary
 * color). Read-only, no actions. Design-system neutral, dark-mode aware.
 */
@Builder
public record Meter(
    String id,
    String label,
    Double value,
    Double max,
    String unit,
    String caption,
    Double warnAt,
    Double dangerAt,
    String style,
    String cssClasses)
    implements Component {}
