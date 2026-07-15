package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A plain bulleted list — renders as a simple {@code <ul>} of text items. For read-only
 * enumerations (preferences, highlights, notes) where the chrome of a {@link StatusList} would be
 * too much. Design-system neutral, dark-mode aware.
 *
 * <p>Also available declaratively: annotate a {@code List<String>} field with {@code @BulletedList}
 * to render its value the same way.
 */
@Builder
public record BulletedList(String id, List<String> items, String style, String cssClasses)
    implements Component {}
