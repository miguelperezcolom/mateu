package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/**
 * One group of a {@link TaskQueue}: a small-caps muted {@code label} (e.g. {@code "Llegadas hoy"})
 * over its list of {@link QueueItem} cards.
 */
@Builder
public record QueueGroup(String label, List<QueueItem> items) {}
