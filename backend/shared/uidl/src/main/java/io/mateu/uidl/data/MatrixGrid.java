package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A MATRIX of values by column — typically metrics or types (rows) by dates (columns), the shape of
 * an availability or forecast grid. Rows are grouped in collapsible {@link MatrixSection}s; a
 * section with a blank title puts its rows at the top level.
 *
 * <p>A cell marked {@code link} dispatches {@code cellActionId} on click; a cell of an {@code
 * editable} row can be edited in place and commits through {@code editActionId}. Both receive
 * {@code { "_rowId", "_columnId", "_value" }} as parameters, so an {@code @Action} method reads
 * which cell it was from the request.
 */
@Builder
public record MatrixGrid(
    String id,
    String rowHeaderLabel,
    List<MatrixColumn> columns,
    List<MatrixSection> sections,
    String cellActionId,
    String editActionId,
    String style,
    String cssClasses)
    implements Component {}
