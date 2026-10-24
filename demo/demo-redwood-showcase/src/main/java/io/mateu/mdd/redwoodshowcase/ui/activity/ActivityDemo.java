package io.mateu.mdd.redwoodshowcase.ui.activity;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FileItem;
import io.mateu.uidl.data.FileList;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Timeline;
import io.mateu.uidl.data.TimelineItem;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/**
 * Demo of the {@link FileList} (attachments) and {@link Timeline} (activity) display components —
 * on Redwood they are Spectra's oj-sp-attachment-chip and oj-sp-timeline-event-template.
 */
@UI("/activity-demo")
@Title("Attachments & activity")
public class ActivityDemo {

  @Section("Attachments")
  Component files =
      new FileList(
          "files",
          List.of(
              new FileItem("Contract.pdf", "1.2 MB", "application/pdf", "/files/contract.pdf", null),
              new FileItem("Rooming list.xlsx", "48 KB", "xlsx", "/files/rooming.xlsx", null),
              new FileItem("Floor plan.png", "860 KB", "image/png", null, "openFloorPlan")),
          null,
          null);

  @Section("Activity")
  Component activity =
      new Timeline(
          "activity",
          List.of(
              new TimelineItem(
                  "e1", "Booking created", "Created by Ana Pérez from the web", "Oct 20, 09:12", null, null, null),
              new TimelineItem(
                  "e2", "Payment received", "Deposit of 350 € by card", "Oct 21, 17:40", null, "success", null),
              new TimelineItem(
                  "e3", "Room changed", "Moved from 204 to 311", "Oct 23, 11:05", null, "warning", "openChange")),
          null,
          null);

  @Action
  Object openFloorPlan() {
    return new Message("This would open the floor plan");
  }

  @Action
  Object openChange() {
    return new Message("This would open the room change");
  }
}
