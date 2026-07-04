package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A shimmering placeholder shown while real content loads. Variants mimic common shapes: {@code
 * text} (lines of copy), {@code card} (a tile), {@code grid} (table rows), {@code form} (label +
 * field pairs). {@code count} repeats the shape (lines, rows or fields).
 */
@Builder
public record Skeleton(
    String id, SkeletonVariant variant, int count, String style, String cssClasses)
    implements Component {}
