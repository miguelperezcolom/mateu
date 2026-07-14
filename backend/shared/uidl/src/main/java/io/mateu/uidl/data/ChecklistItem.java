package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One item of a {@link Checklist}: a {@code label}, a {@code done} flag, and an optional {@code
 * actionId} dispatched (with the item) when the checkbox is toggled.
 */
@Builder
public record ChecklistItem(String id, String label, boolean done, String actionId) {}
