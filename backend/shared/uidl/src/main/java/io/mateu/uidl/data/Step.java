package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One step of a {@link Stepper}. {@code status} is one of {@code "done"}, {@code "current"} or
 * {@code "upcoming"} (default {@code "upcoming"}) — it drives the dot's color and check mark.
 */
@Builder
public record Step(String id, String title, String description, String status) {}
