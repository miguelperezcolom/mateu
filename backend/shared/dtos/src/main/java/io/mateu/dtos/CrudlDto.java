package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * A crud
 *
 * @param title The title
 * @param subtitle The subtitle
 * @param canEdit If records can be edited. This make the Edit button visible
 * @param searchable If list can be searched
 * @param columns The columns
 * @param child This crud is a child of another view. This makes the title smaller
 */
@Builder
public record CrudlDto(
    CrudlTypeDto crudlType,
    String title,
    String subtitle,
    boolean canEdit,
    boolean selectionListened,
    boolean hasActionOnSelectedRow,
    boolean multipleRowSelectionEnabled,
    boolean searchable,
    boolean showCards,
    List<FormFieldDto> filters,
    List<ComponentDto> columns,
    List<ButtonDto> toolbar,
    boolean child,
    String emptyStateMessage,
    boolean searchOnEnter,
    boolean autoFocusOnSearchText,
    boolean allRowsVisible,
    int size,
    boolean lazyLoading,
    boolean lazyColumnRendering,
    boolean infiniteScrolling,
    boolean useButtonForDetail,
    boolean columnReorderingAllowed,
    int pageSize,
    boolean rowsSelectionEnabled,
    List<ComponentDto> header,
    List<ComponentDto> footer,
    boolean wrapCellContent,
    boolean compact,
    boolean noBorder,
    boolean noRowBorder,
    boolean columnBorders,
    boolean rowStripes,
    String vaadinGridCellBackground,
    String vaadinGridCellPadding,
    String gridStyle,
    String detailPath,
    String onRowSelectionChangedActionId)
    implements ComponentMetadataDto {

  public CrudlDto {
    columns = Collections.unmodifiableList(columns != null ? columns : Collections.emptyList());
  }

  public List<ComponentDto> columns() {
    return Collections.unmodifiableList(columns);
  }
}
