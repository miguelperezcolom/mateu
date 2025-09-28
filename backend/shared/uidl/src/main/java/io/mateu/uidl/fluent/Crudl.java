package io.mateu.uidl.fluent;

import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridContent;
import java.util.List;
import lombok.Builder;

@Builder
public record Crudl(
    CrudlType crudlType,
    String id,
    String title,
    String subtitle,
    List<Trigger> triggers,
    List<UserTrigger> toolbar,
    List<GridContent> columns,
    boolean searchable,
    List<FormField> filters,
    String style,
    String cssClasses,
    String emptyStateMessage,
    Boolean searchOnEnter,
    Boolean autoFocusOnSearchText,
    boolean allRowsVisible,
    int size,
    boolean lazyLoading,
    boolean lazyColumnRendering,
    boolean infiniteScrolling,
    boolean useButtonForDetail,
    boolean columnReorderingAllowed,
    int pageSize,
    boolean rowsSelectionEnabled,
    List<Component> header,
    List<Component> footer,
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
    String onRowSelectionChangedActionId,
    String contentHeight)
    implements Component, PageMainContent {

  public Boolean autoFocusOnSearchText() {
    return autoFocusOnSearchText != null ? autoFocusOnSearchText : true;
  }

  @Override
  public Boolean searchOnEnter() {
    return searchOnEnter != null ? searchOnEnter : true;
  }

  @Override
  public List<Component> header() {
    return header != null ? header : List.of();
  }

  @Override
  public List<Component> footer() {
    return footer != null ? footer : List.of();
  }

  @Override
  public List<Trigger> triggers() {
    return triggers != null ? triggers : List.of();
  }

  @Override
  public List<UserTrigger> toolbar() {
    return toolbar != null ? toolbar : List.of();
  }

  public List<GridContent> columns() {
    return columns != null ? columns : List.of();
  }

  @Override
  public int pageSize() {
    return pageSize > 0 ? pageSize : 10;
  }
}
