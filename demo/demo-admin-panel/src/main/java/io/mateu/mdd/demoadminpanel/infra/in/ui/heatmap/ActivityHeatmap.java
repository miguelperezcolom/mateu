package io.mateu.mdd.demoadminpanel.infra.in.ui.heatmap;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.HeatCell;
import io.mateu.uidl.data.Heatmap;
import io.mateu.uidl.fluent.Component;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Demo of the {@link Heatmap} component: a year of activity, GitHub-style. */
@UI("/heatmap-demo")
@Title("Activity")
public class ActivityHeatmap {

  @Section("Commits this year")
  Component heatmap = build();

  private static Component build() {
    var cells = new ArrayList<HeatCell>();
    var start = LocalDate.of(2026, 1, 1);
    // deterministic pseudo-random pattern (no Math.random in this codebase's spirit)
    for (int i = 0; i < 210; i++) {
      var date = start.plusDays(i);
      int v = (int) ((Math.sin(i * 0.7) + 1) * 2.5 * ((i % 9 == 0) ? 0 : 1));
      cells.add(HeatCell.builder().date(date).value(v).build());
    }
    return Heatmap.builder().cells(cells).build();
  }
}
