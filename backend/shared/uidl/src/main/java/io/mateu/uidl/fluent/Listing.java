package io.mateu.uidl.fluent;

import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridContent;
import java.util.List;
import lombok.Builder;
import lombok.Singular;

@Builder
public record Listing(
    ListingType listingType,
    String id,
    String title,
    String subtitle,
    @Singular List<Trigger> triggers,
    @Singular("toolbarItem") List<UserTrigger> toolbar,
    @Singular List<GridContent> columns,
    boolean searchable,
    @Singular List<FormField> filters,
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
    @Singular("headerItem") List<Component> header,
    @Singular("footerItem") List<Component> footer,
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
    /**
     * Where a row click goes, as a template over the row: {@code "people/${row.id}"}.
     *
     * <p>This is what makes a listing the entrance to a record rather than the whole of it. Without
     * it the only detail a listing without a view model could offer was {@code gridLayout:
     * masterDetail}, which paints a pane from the row already fetched — not addressable, not
     * shareable, and gone on reload. A route is all three.
     *
     * <p>Interpolated against the clicked row (as {@code row}) and the listing state, so a row's
     * own id picks the record. Empty means a row click does nothing, which stays the default.
     */
    String rowRoute,
    String onRowSelectionChangedActionId,
    String contentHeight,
    int initialPage,
    FiltersLayout filtersLayout,
    GridLayout gridLayout,
    String groupBy,
    @Singular("groupAction") List<UserTrigger> groupActions,
    io.mateu.uidl.data.RestDataSource rowsSource)
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

  public FiltersLayout filtersLayout() {
    return filtersLayout != null ? filtersLayout : FiltersLayout.auto;
  }

  public GridLayout gridLayout() {
    return gridLayout != null ? gridLayout : GridLayout.auto;
  }
}
