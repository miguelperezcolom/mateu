package io.mateu.explorer.examples.components.matrixgrid;

import io.mateu.uidl.data.MatrixCell;
import io.mateu.uidl.data.MatrixColumn;
import io.mateu.uidl.data.MatrixGrid;
import io.mateu.uidl.data.MatrixRow;
import io.mateu.uidl.data.MatrixSection;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Ticket quotas per slot (rows) and day (columns). The quota row is {@code editable}: type a number
 * in a cell and {@code editActionId} runs with {@code _rowId}, {@code _columnId} and {@code
 * _value}. The "sold" cells are {@code link}s: a click runs {@code cellActionId} with the same
 * parameters. The "left" row is computed — it changes as you edit the quota.
 */
public class TicketQuota implements ComponentTreeSupplier {

  static final LocalDate FROM = LocalDate.of(2026, 11, 9);
  static final int DAYS = 7;
  static final int[] SOLD = {120, 95, 140, 180, 210, 260, 240};

  /** day (ISO date) → quota: the editable state. */
  Map<String, Integer> quota = new LinkedHashMap<>();

  @Override
  public Component component(HttpRequest httpRequest) {
    var columns = new ArrayList<MatrixColumn>();
    var quotaCells = new ArrayList<MatrixCell>();
    var soldCells = new ArrayList<MatrixCell>();
    var leftCells = new ArrayList<MatrixCell>();
    for (int i = 0; i < DAYS; i++) {
      var day = FROM.plusDays(i);
      var weekend = day.getDayOfWeek() == DayOfWeek.SATURDAY || day.getDayOfWeek() == DayOfWeek.SUNDAY;
      columns.add(new MatrixColumn(day.toString(), day.getDayOfMonth() + "", "November", weekend ? "info" : null));
      int q = quota.getOrDefault(day.toString(), 250);
      int left = q - SOLD[i];
      quotaCells.add(new MatrixCell(q + "", null, false));
      soldCells.add(new MatrixCell(SOLD[i] + "", null, true));
      leftCells.add(new MatrixCell(left + "", left < 20 ? "danger" : left < 60 ? "warning" : "success", false));
    }
    return MatrixGrid.builder()
        .rowHeaderLabel("Timed entry · 10:00")
        .columns(columns)
        .sections(
            List.of(
                new MatrixSection(
                    "tickets",
                    "Tickets",
                    false,
                    List.of(
                        new MatrixRow("quota", "Quota", quotaCells, true, false),
                        new MatrixRow("sold", "Sold", soldCells, false, false),
                        new MatrixRow("left", "Left", leftCells, false, true)))))
        .editActionId("quotaEdited")
        .cellActionId("cellClicked")
        .build();
  }

  public Object quotaEdited(HttpRequest httpRequest) {
    var p = httpRequest.runActionRq().parameters();
    var day = (String) p.get("_columnId");
    quota.put(day, Integer.parseInt(String.valueOf(p.get("_value")).trim()));
    return List.of(this, Message.success("Quota for " + day + " is now " + quota.get(day)));
  }

  public Message cellClicked(HttpRequest httpRequest) {
    var p = httpRequest.runActionRq().parameters();
    return new Message(p.get("_value") + " tickets sold on " + p.get("_columnId"));
  }
}
