package io.mateu.explorer.examples.archetypes.datamanagement;

import io.mateu.core.infra.declarative.orchestrators.datamanagement.DataManagement;
import io.mateu.uidl.data.DockedPanel;
import io.mateu.uidl.data.Gantt;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;

/**
 * The {@code DataManagement} archetype: the same data two ways — a dense grid and a Gantt timeline
 * — with a toolbar switcher, plus two docked panels (end and bottom) the toolbar toggles. The
 * active view and the panels' state live in the page; switching re-renders in place.
 */
public class LoanPlan extends DataManagement {

  record Loan(String id, String artwork, String borrower, LocalDate out, LocalDate back, int progress) {}

  /** The grid's row: field names are the column ids. */
  public record Row(String artwork, String borrower, String out, String back) {}

  static final List<Loan> LOANS =
      List.of(
          new Loan("l1", "Water Lilies", "SMK", LocalDate.of(2026, 9, 1), LocalDate.of(2027, 1, 15), 60),
          new Loan("l2", "The Great Wave", "British Museum", LocalDate.of(2026, 10, 10), LocalDate.of(2027, 3, 30), 25),
          new Loan("l3", "Melencolia I", "Albertina", LocalDate.of(2026, 11, 1), LocalDate.of(2027, 2, 10), 10),
          new Loan("l4", "Self-Portrait", "Van Gogh Museum", LocalDate.of(2026, 12, 1), LocalDate.of(2027, 6, 1), 0));

  @Override
  protected String gridLabel() {
    return "Table";
  }

  @Override
  protected String ganttLabel() {
    return "Timeline";
  }

  @Override
  protected Component gridView(HttpRequest httpRequest) {
    List<Object> rows =
        LOANS.stream()
            .<Object>map(l -> new Row(l.artwork(), l.borrower(), l.out().toString(), l.back().toString()))
            .toList();
    return Grid.builder()
        .compact(true)
        .content(
            List.of(
                GridColumn.builder().id("artwork").label("Artwork").build(),
                GridColumn.builder().id("borrower").label("Borrower").build(),
                GridColumn.builder().id("out").label("Leaves").build(),
                GridColumn.builder().id("back").label("Returns").build()))
        .page(new Page<>("", 20, 0, rows.size(), rows))
        .build();
  }

  @Override
  protected Component ganttView(HttpRequest httpRequest) {
    return Gantt.builder()
        .tasks(
            LOANS.stream()
                .map(l -> new GanttTask(l.id(), l.artwork() + " → " + l.borrower(), l.out(), l.back(), l.progress(), null))
                .toList())
        .build();
  }

  @Override
  protected DockedPanel endPanel(HttpRequest httpRequest) {
    return new DockedPanel("summary", "Summary", new Text("4 loans out · 2 return before March."), "18rem", true);
  }

  @Override
  protected DockedPanel bottomPanel(HttpRequest httpRequest) {
    return new DockedPanel("log", "Activity", new Text("09:12 Ana extended “Water Lilies” to 15 January."), "8rem", false);
  }
}
