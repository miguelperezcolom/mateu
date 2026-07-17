package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A read-only horizontal progress indicator: a row of numbered {@link Step}s connected by a line,
 * showing where a multi-step process stands. Unlike a {@code Wizard}, this only VISUALIZES progress
 * — it drives no navigation. Design-system neutral, dark-mode aware.
 */
@Builder
public record ProgressSteps(
    String id, List<Step> steps, boolean vertical, String style, String cssClasses)
    implements Component {}
