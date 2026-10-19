package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/** A data table with columns, rows and optional tree, striping and border options. */
@Builder
public record Grid(
    String id,
    List<GridContent> content,
    Page<?> page,
    boolean tree,
    int size,
    String style,
    String cssClasses,
    boolean wrapCellContent,
    boolean compact,
    boolean noBorder,
    boolean noRowBorder,
    boolean columnBorders,
    boolean rowStripes,
    String vaadinGridCellBackground,
    String vaadinGridCellPadding)
    implements Component {}
