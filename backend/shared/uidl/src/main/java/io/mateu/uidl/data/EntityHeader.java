package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A persistent context banner for the entity a flow operates on (e.g. the guest of a check-in
 * wizard): the {@code title} with its {@code badges} ({@link Chip}s), a {@code subtitle}, key
 * {@code facts} ({@link Fact} label-over-value pairs) and one highlighted metric on the right
 * ({@code metricLabel}, big accent-colored {@code metricValue}, {@code metricCaption}). Read-only,
 * no actions. Design-system neutral, dark-mode aware.
 */
@Builder
public record EntityHeader(
    String id,
    String title,
    List<Chip> badges,
    String subtitle,
    List<Fact> facts,
    String metricLabel,
    String metricValue,
    String metricCaption,
    String style,
    String cssClasses)
    implements Component {}
