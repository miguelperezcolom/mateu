package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.ProcessItem;
import io.mateu.uidl.data.ProcessMonitor;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link ProcessMonitor} component: monitored back-office automations. */
@UI("/process-monitor-demo")
@Title("Automations")
public class AutomationsMonitor {

  @Section("Procesos automatizados")
  Component processes =
      ProcessMonitor.builder()
          .items(
              List.of(
                  ProcessItem.builder()
                      .id("credit")
                      .name("Facturación a Crédito")
                      .systems(List.of("OHIP", "OIC", "Voxel"))
                      .ok(847)
                      .warnings(6)
                      .errors(0)
                      .status("warning")
                      .actionLabel("Solucionar")
                      .actionId("fixCredit")
                      .build(),
                  ProcessItem.builder()
                      .id("sales")
                      .name("Comercializadora")
                      .systems(List.of("OHIP", "ERP Fusion A/R"))
                      .ok(418)
                      .warnings(0)
                      .errors(0)
                      .status("ok")
                      .build(),
                  ProcessItem.builder()
                      .id("ota")
                      .name("Sincronización OTAs")
                      .systems(List.of("Channel Manager", "Booking", "Expedia"))
                      .ok(1204)
                      .warnings(0)
                      .errors(2)
                      .status("error")
                      .actionLabel("Solucionar")
                      .actionId("fixOta")
                      .build()))
          .build();

  @Action
  Object fixCredit() {
    return new Message("This would open the credit invoicing incidents");
  }

  @Action
  Object fixOta() {
    return new Message("This would open the OTA sync errors");
  }
}
