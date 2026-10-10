package io.mateu.sample1.app.patterns;

import io.mateu.core.infra.declarative.orchestrators.datamanagement.DataManagement;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.BulletedList;
import io.mateu.uidl.data.DockedPanel;
import io.mateu.uidl.data.Gantt;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;

/** Pattern gaps showcase: DataManagement's docked end and bottom panels (reflow, not overlay). */
@UI("/patterns/data")
@Title("Shipments")
public class DockedDataManagement extends DataManagement {

  @Override
  protected Component gridView(HttpRequest httpRequest) {
    return new BulletedList(
        "shipments",
        List.of(
            "SHP-001 · Palma → Madrid · in transit",
            "SHP-002 · Madrid → Lisboa · loading",
            "SHP-003 · Lisboa → Porto · delivered"),
        null,
        null);
  }

  @Override
  protected Component ganttView(HttpRequest httpRequest) {
    var today = LocalDate.now();
    return Gantt.builder()
        .tasks(
            List.of(
                GanttTask.builder()
                    .id("SHP-001")
                    .title("SHP-001")
                    .start(today)
                    .end(today.plusDays(3))
                    .progress(40)
                    .build()))
        .build();
  }

  @Override
  protected DockedPanel endPanel(HttpRequest httpRequest) {
    return DockedPanel.builder()
        .id("details")
        .title("Details")
        .content(new Text("details-body", "SHP-001 — 12 pallets, ETA tomorrow 10:00."))
        .open(true)
        .build();
  }

  @Override
  protected DockedPanel bottomPanel(HttpRequest httpRequest) {
    return DockedPanel.builder()
        .id("log")
        .title("Log")
        .content(new Text("log-body", "10:02 SHP-002 loading started · 09:41 SHP-003 delivered"))
        .open(true)
        .build();
  }
}
