package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A read-only vertical timeline / activity feed: a chronological list of {@link TimelineItem}s,
 * each a dot on a vertical rail with a title, optional description, timestamp label and icon. An
 * item with an {@code actionId} is clickable and dispatches the standard {@code action-requested}
 * event.
 */
@Builder
public record Timeline(String id, List<TimelineItem> items, String style, String cssClasses)
    implements Component {}
