package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record Grid(
    String id,
    List<GridColumn> columns,
    Page<?> page,
    boolean tree,
    boolean bindToData,
    String style,
    String cssClasses)
    implements Component {}
