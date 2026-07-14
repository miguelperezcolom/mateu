package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/** Result — the read-only confirmation screen shown after the check-in is confirmed. */
@Getter
@Setter
@PlainText
@FormLayout(columns = 1)
public class ResultStep implements WizardStep {

  @Hidden String guestId;

  @Hidden String habitacionFinal;

  @Multiline
  @Label("")
  String mensaje;

  @Label("")
  @com.fasterxml.jackson.annotation.JsonIgnore
  Callable<Component> resultado =
      () ->
          StatusList.builder().style("width: 100%;")
              .items(
                  List.of(
                      StatusItem.builder()
                          .id("hab")
                          .icon("🛏")
                          .title("Habitación asignada")
                          .description(habitacionFinal)
                          .status("Hecho")
                          .statusColor("success")
                          .build(),
                      StatusItem.builder()
                          .id("email")
                          .icon("✉")
                          .title("Email de bienvenida enviado")
                          .description("Con la llave digital y la información de la estancia")
                          .status("Enviado")
                          .statusColor("success")
                          .build(),
                      StatusItem.builder()
                          .id("ses")
                          .icon("✓")
                          .title("Parte de viajeros (SES) transmitido")
                          .description("Registro automático completado")
                          .status("Enviado")
                          .statusColor("success")
                          .build(),
                      StatusItem.builder()
                          .id("folio")
                          .icon("💳")
                          .title("Folio abierto")
                          .description("Cargos de estancia y extras activados")
                          .status("Activo")
                          .statusColor("success")
                          .build()))
              .build();
}
