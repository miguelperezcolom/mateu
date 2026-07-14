package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link StatusList} component: incidents and check-in side effects. */
@UI("/status-list-demo")
@Title("Incidents & tasks")
public class IncidentsList {

  @Section("Incidencias y tareas")
  Component items =
      StatusList.builder()
          .items(
              List.of(
                  StatusItem.builder()
                      .id("ac")
                      .icon("🌡")
                      .title("Aire acondicionado con ruido")
                      .description("Habitación 901 · Reportado 28 Apr · Mantenimiento avisado")
                      .status("En curso")
                      .statusColor("normal")
                      .build(),
                  StatusItem.builder()
                      .id("key")
                      .icon("🔑")
                      .title("Grabar llave / pulsera")
                      .description("Complemento de llave digital")
                      .actionLabel("Grabar")
                      .actionId("encodeKey")
                      .build(),
                  StatusItem.builder()
                      .id("ses")
                      .icon("✓")
                      .title("Parte viajeros (SES)")
                      .description("Se enviará automáticamente al confirmar el check-in")
                      .status("Automático")
                      .statusColor("success")
                      .build()))
          .build();

  @Action
  Object encodeKey() {
    return new Message("This would encode the digital key / wristband");
  }
}
