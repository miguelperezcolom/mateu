package io.mateu.core.infra.declarative.orchestrators.datamanagement;

import io.mateu.core.domain.out.componentmapper.ReflectionPageMapper;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.DockedPanel;
import io.mateu.uidl.data.GridTrack;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.ResponsiveGrid;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextSize;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PageWidthSupplier;
import java.util.ArrayList;
import java.util.List;

/**
 * Data management page (the Oracle Redwood "Data management" template): a dense, full-width page
 * that presents the same data set two ways — a data grid and a Gantt timeline — with a toolbar
 * switcher to flip between them, so the user can review it as a table or as a schedule.
 *
 * <p>Extend it and supply the two views: {@link #gridView(HttpRequest)} (typically a dense table —
 * an embedded crud/listing or a fluent grid) and {@link #ganttView(HttpRequest)} (a {@link
 * io.mateu.uidl.data.Gantt}, e.g. a {@code GanttPage}'s canvas). The page lays out full width,
 * keeps the active view in state ({@code _view}), and re-renders in place when the user switches.
 * Pure composition of existing components, so it renders on every renderer.
 */
public abstract class DataManagement implements ComponentTreeSupplier, PageWidthSupplier {

  /** The active view: {@code "grid"} (default) or {@code "gantt"}. Bound from componentState. */
  protected String _view = "grid";

  /** Whether the end (side) panel is open; null = its {@link DockedPanel#open()} default. */
  protected Boolean _endOpen;

  /** Whether the bottom panel is open; null = its {@link DockedPanel#open()} default. */
  protected Boolean _bottomOpen;

  /**
   * A panel docked at the END of the content (the Redwood data-management {@code innerEnd} slot): a
   * details or properties pane beside the grid/gantt, which shrinks to make room (it reflows, it
   * does not overlay). The page adds a toggle for it to its toolbar. Null (the default) = none.
   */
  protected DockedPanel endPanel(HttpRequest httpRequest) {
    return null;
  }

  /**
   * A panel docked UNDER the content (the Redwood data-management {@code innerBottom} slot): a
   * messages, log or totals strip. Toggled from the toolbar like {@link #endPanel}. Null (the
   * default) = none.
   */
  protected DockedPanel bottomPanel(HttpRequest httpRequest) {
    return null;
  }

  @Override
  public PageWidthStyle pageWidth() {
    return PageWidthStyle.FULL_WIDTH;
  }

  /** The data-grid view (typically a dense table — an embedded crud/listing or a fluent grid). */
  protected abstract Component gridView(HttpRequest httpRequest);

  /** The Gantt/timeline view of the same data. */
  protected abstract Component ganttView(HttpRequest httpRequest);

  protected String gridLabel() {
    return "Grid";
  }

  protected String ganttLabel() {
    return "Gantt";
  }

  /** Page heading above the toolbar; defaults to the class {@code @Title}, blank/null hides it. */
  protected String heading() {
    return ReflectionPageMapper.getTitle(this);
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    boolean gantt = "gantt".equals(_view);
    var end = endPanel(httpRequest);
    var bottom = bottomPanel(httpRequest);
    boolean endOpen = end != null && (_endOpen != null ? _endOpen : end.open());
    boolean bottomOpen = bottom != null && (_bottomOpen != null ? _bottomOpen : bottom.open());
    List<Component> toolbar = new ArrayList<>();
    toolbar.add(
        Button.builder()
            .actionId("switchToGrid")
            .label(gridLabel())
            .buttonStyle(gantt ? ButtonStyle.tertiary : ButtonStyle.primary)
            .build());
    toolbar.add(
        Button.builder()
            .actionId("switchToGantt")
            .label(ganttLabel())
            .buttonStyle(gantt ? ButtonStyle.primary : ButtonStyle.tertiary)
            .build());
    if (end != null) {
      toolbar.add(panelToggle(end, "toggleEndPanel", endOpen));
    }
    if (bottom != null) {
      toolbar.add(panelToggle(bottom, "toggleBottomPanel", bottomOpen));
    }
    List<Component> content = new ArrayList<>();
    String heading = heading();
    if (heading != null && !heading.isBlank()) {
      content.add(
          Text.builder()
              .id("data-management-title")
              .text(heading)
              .size(TextSize.xl)
              .noMargins(true)
              .style("font-weight: 600;")
              .build());
    }
    content.add(
        HorizontalLayout.builder()
            .id("data-management-toolbar")
            .spacing(true)
            .style("align-items: center;")
            .content(toolbar)
            .build());
    Component main = gantt ? ganttView(httpRequest) : gridView(httpRequest);
    if (endOpen) {
      // the end panel REFLOWS the content: a fill track for the view + a fixed one for the panel,
      // stacking below 48rem (the panel then goes under the view)
      main =
          new ResponsiveGrid(
              "data-management-body",
              List.of(GridTrack.fill(), GridTrack.fixed(end.size() != null ? end.size() : "22rem")),
              null,
              List.of(
                  main,
                  dockedPanel(
                      end,
                      "toggleEndPanel",
                      "border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));"
                          + " padding-left: var(--lumo-space-m, 1rem);")),
              null,
              "48rem",
              null);
    }
    content.add(main);
    if (bottomOpen) {
      content.add(
          dockedPanel(
              bottom,
              "toggleBottomPanel",
              "border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));"
                  + " padding-top: var(--lumo-space-s, .5rem); max-height: "
                  + (bottom.size() != null ? bottom.size() : "16rem")
                  + "; overflow: auto;"));
    }
    return VerticalLayout.builder()
        .id("data-management")
        .fullWidth(true)
        .spacing(true)
        .content(content)
        .build();
  }

  private Component panelToggle(DockedPanel panel, String actionId, boolean open) {
    return Button.builder()
        .id(panel.id() != null ? panel.id() + "-toggle" : actionId)
        .actionId(actionId)
        .label(panel.title())
        .buttonStyle(open ? ButtonStyle.primary : ButtonStyle.tertiary)
        .build();
  }

  private Component dockedPanel(DockedPanel panel, String closeActionId, String style) {
    List<Component> header = new ArrayList<>();
    header.add(
        Text.builder()
            .text(panel.title())
            .size(TextSize.m)
            .noMargins(true)
            .style("font-weight: 600; flex: 1;")
            .build());
    header.add(
        Button.builder()
            .actionId(closeActionId)
            .label("✕")
            .buttonStyle(ButtonStyle.tertiary)
            .build());
    List<Component> body = new ArrayList<>();
    body.add(
        HorizontalLayout.builder()
            .style("align-items: center; width: 100%;")
            .content(header)
            .build());
    if (panel.content() != null) {
      body.add(panel.content());
    }
    return VerticalLayout.builder()
        .id(panel.id())
        .cssClasses("mateu-docked-panel")
        .style(style)
        .content(body)
        .build();
  }

  @Action
  public Object toggleEndPanel(HttpRequest httpRequest) {
    var end = endPanel(httpRequest);
    boolean open = end != null && (_endOpen != null ? _endOpen : end.open());
    _endOpen = !open;
    return this;
  }

  @Action
  public Object toggleBottomPanel(HttpRequest httpRequest) {
    var bottom = bottomPanel(httpRequest);
    boolean open = bottom != null && (_bottomOpen != null ? _bottomOpen : bottom.open());
    _bottomOpen = !open;
    return this;
  }

  @Action
  public Object switchToGrid(HttpRequest httpRequest) {
    _view = "grid";
    return this;
  }

  @Action
  public Object switchToGantt(HttpRequest httpRequest) {
    _view = "gantt";
    return this;
  }

  /** Full-width dense page: no centered max-width cap. */
  @Override
  public String style() {
    return null;
  }
}
