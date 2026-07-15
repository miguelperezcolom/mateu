package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.fluent.Component;
import java.util.ArrayList;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/** Step 4 — Confirmar: stay summary, guests in the room, total and check-in side effects. */
@Getter
@Setter
@FormLayout(columns = 1)
public class ConfirmarStep implements WizardStep {

  @Hidden String stayId;

  @Label("")
  Callable<Component> header = () -> GuestHeaders.arrivalHeader(stayId);

  @PlainText
  @Label("Huésped principal")
  String huespedPrincipal;

  @PlainText
  @Label("Habitación")
  String habitacionAsignada;

  @PlainText
  @Label("Estancia")
  String estancia;

  @PlainText
  @Label("Régimen")
  String regimen;

  @Label("")
  Callable<Component> huespedesEnHabitacion =
      () -> {
        var view = FrontOffice.stayView(stayId);
        var stay = view.stay();
        var guest = view.guest();
        var items = new ArrayList<StatusItem>();
        items.add(
            StatusItem.builder()
                .id("principal")
                .icon("👤")
                .title(guest.name())
                .description(
                    (guest.document() == null || guest.document().isBlank()
                            ? "Documento escaneado"
                            : "Doc " + guest.document())
                        + " · Adulto")
                .status("✓ Identidad verificada")
                .statusColor("success")
                .build());
        for (var companion : stay.companions()) {
          items.add(
              StatusItem.builder()
                  .id(companion.companionId())
                  .icon("👤")
                  .title(companion.name())
                  .description(companion.description())
                  .status("✓ Identidad verificada")
                  .statusColor("success")
                  .build());
        }
        for (int i = 2 + stay.companions().size(); i <= stay.pax(); i++) {
          items.add(
              StatusItem.builder()
                  .id("pax" + i)
                  .icon("👤")
                  .title("Acompañante " + i)
                  .description("Pendiente de registro")
                  .status("Pendiente")
                  .statusColor("warning")
                  .build());
        }
        return StatusList.builder().items(items).style("width: 100%;").build();
      };

  @PlainText
  @Stereotype(FieldStereotype.money)
  @Label("TOTAL ESTANCIA")
  Double totalEstancia;

  @Label("")
  Callable<Component> efectosCheckIn =
      () ->
          StatusList.builder()
              .style("width: 100%;")
              .items(
                  java.util.List.of(
                      StatusItem.builder()
                          .id("llave")
                          .icon("🔑")
                          .title("Grabar llave / pulsera")
                          .description("Complemento de llave digital")
                          .actionLabel("Grabar")
                          .actionId("encodeKey")
                          .build(),
                      StatusItem.builder()
                          .id("email")
                          .icon("✉")
                          .title("Email de bienvenida")
                          .description("Envío automatizado al confirmar")
                          .status("ACTIVADO")
                          .statusColor("success")
                          .build(),
                      StatusItem.builder()
                          .id("ses")
                          .icon("✓")
                          .title("Parte viajeros (SES)")
                          .description("Se enviará automáticamente al confirmar el check-in")
                          .status("Automático")
                          .statusColor("success")
                          .build(),
                      StatusItem.builder()
                          .id("firma")
                          .icon("✍")
                          .title("Firma de bienvenida — tablet Civitfun")
                          .description(
                              "Envía el documento de registro a la tablet del mostrador para la"
                                  + " firma del huésped")
                          .actionLabel("Enviar a tablet")
                          .actionId("sendToTablet")
                          .build()))
              .build();
}
