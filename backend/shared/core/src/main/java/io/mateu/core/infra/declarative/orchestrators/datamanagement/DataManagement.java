package io.mateu.core.infra.declarative.orchestrators.datamanagement;

import io.mateu.core.domain.out.componentmapper.ReflectionPageMapper;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.HorizontalLayout;
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
            .content(
                List.of(
                    Button.builder()
                        .actionId("switchToGrid")
                        .label(gridLabel())
                        .buttonStyle(gantt ? ButtonStyle.tertiary : ButtonStyle.primary)
                        .build(),
                    Button.builder()
                        .actionId("switchToGantt")
                        .label(ganttLabel())
                        .buttonStyle(gantt ? ButtonStyle.primary : ButtonStyle.tertiary)
                        .build()))
            .build());
    content.add(gantt ? ganttView(httpRequest) : gridView(httpRequest));
    return VerticalLayout.builder()
        .id("data-management")
        .fullWidth(true)
        .spacing(true)
        .content(content)
        .build();
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
