package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * Redwood-style foldout: a fixed overview panel on the left with general information about the
 * current record, plus two or more lateral {@link FoldoutPanel}s with categories of associated
 * information that the user folds in and out. Open panels sit side by side and scroll horizontally.
 */
@Builder
public record FoldoutLayout(
    String id,
    Component overview,
    List<FoldoutPanel> panels,
    String headerTitle,
    List<Badge> badges,
    String style,
    String cssClasses)
    implements Component {}
