package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/**
 * One card of a {@link TaskQueue} group: a {@code title}, a muted {@code caption} (e.g. room and
 * nights), a row of {@code badges} ({@link Chip}s) and a {@code selected} flag that highlights the
 * card with an accent border. Clicking the card dispatches the queue-level actionId with {@code {
 * "_item": id }}.
 */
@Builder
public record QueueItem(
    String id, String title, String caption, List<Chip> badges, boolean selected) {}
