package io.mateu.uidl.data;

import lombok.Builder;

/**
 * A small labeled chip with an optional badge-palette {@code color} ({@code normal}, {@code
 * success}, {@code warning}, {@code error}, {@code contrast}). Used as a badge by {@link
 * EntityHeader} and {@link QueueItem}.
 */
@Builder
public record Chip(String label, String color) {}
