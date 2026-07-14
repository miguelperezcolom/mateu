package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A responsive grid of feature cards (icon + title + description), for landing/marketing pages. A
 * feature with an {@code actionId} is clickable. {@code columns} fixes the column count (0 =
 * auto-fit). Design-system neutral, dark-mode aware.
 */
@Builder
public record FeatureGrid(
    String id, List<Feature> features, int columns, String style, String cssClasses)
    implements Component {}
