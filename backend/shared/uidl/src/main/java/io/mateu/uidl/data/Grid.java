package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record Grid(
    String id,
    List<GridContent> content,
    Page<?> page,
    boolean tree,
    String style,
    String cssClasses)
    implements Component {}
