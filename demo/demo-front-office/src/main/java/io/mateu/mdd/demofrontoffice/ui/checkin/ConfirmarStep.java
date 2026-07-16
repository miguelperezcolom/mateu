package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.fluent.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/** Step 4 — Confirmar: stay summary, guests in the room, total and check-in side effects. */
@Getter
@Setter
@FormLayout(columns = 1)
public class ConfirmarStep implements WizardStep {

  @Hidden String stayId;
  @Hidden Double totalEstancia;

  // No section → full-width band across the top. Frameless: the header card brings its own chrome.
  @Section(value = "", frameless = true)
  @Label("")
  Callable<Component> header = () -> GuestHeaders.arrivalHeader(stayId);

  // The reservation summary as a read-only property list (label left, value right).
  @Section(value = "Resumen", propertyList = true)
  @Label("Huésped principal")
  String huespedPrincipal;

  @Label("Habitación")
  String habitacionAsignada;

  @Label("Estancia")
  String estancia;

  @Label("Régimen")
  String regimen;

  @Section("Huéspedes en la habitación")
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
                .avatar(initials(guest.name()))
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
                  .avatar(initials(companion.name()))
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
                  .avatar("A" + i)
                  .title("Acompañante " + i)
                  .description("Pendiente de registro")
                  .status("Pendiente")
                  .statusColor("warning")
                  .build());
        }
        return StatusList.builder().items(items).compact(true).style("width: 100%;").build();
      };

  // The stay total framed in a full-width notice, with the pre-authorization CTA on the right.
  // " " (not ""): every other @Section attribute matches the header band's, and two sections with
  // identical attributes collide.
  @Section(value = " ", frameless = true)
  @Label("")
  Callable<Component> totalBand =
      () ->
          Notice.builder()
              .theme("info")
              .icon("💶")
              .text("TOTAL ESTANCIA — " + GuestHeaders.euros(totalEstancia))
              .fullWidth(true)
              .actionLabel("Solicitar Preautorización")
              .actionId("requestPreauth")
              .build();

  // Key + welcome email side by side, each as its own single-row card. Frameless untitled band:
  // the cards/notices bring their own chrome ("  " because "" and " " are taken — sections with
  // identical attributes collide).
  @Section(value = "  ", frameless = true)
  @Label("")
  Callable<Component> llaveYEmail =
      () ->
          HorizontalLayout.builder()
              .content(
                  List.of(
                      StatusList.builder()
                          .style("flex: 1 1 16rem; width: auto;")
                          .items(
                              List.of(
                                  StatusItem.builder()
                                      .id("llave")
                                      .icon("🔑")
                                      .title("Grabar llave / pulsera")
                                      .description("Complemento de llave digital")
                                      .actionLabel("Grabar")
                                      .actionId("encodeKey")
                                      .build()))
                          .build(),
                      StatusList.builder()
                          .style("flex: 1 1 16rem; width: auto;")
                          .items(
                              List.of(
                                  StatusItem.builder()
                                      .id("email")
                                      .icon("✉")
                                      .title("Email de bienvenida")
                                      .description("Envío automatizado al confirmar")
                                      .status("ACTIVADO")
                                      .statusColor("success")
                                      .build()))
                          .build()))
              .style("width: 100%; gap: 1rem; flex-wrap: wrap;")
              .build();

  @Label("")
  Callable<Component> parteViajeros =
      () ->
          Notice.builder()
              .theme("success")
              .text("Parte de viajeros (SES) — se enviará automáticamente al confirmar el check-in")
              .fullWidth(true)
              // the band rows stack with no gap of their own — the middle row spaces all three
              .style("margin: 0.75rem 0;")
              .build();

  @Label("")
  Callable<Component> firma =
      () ->
          StatusList.builder()
              .style("width: 100%;")
              .items(
                  List.of(
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

  /** Initials for the guest avatar: first letter of the first two words of the name. */
  static String initials(String name) {
    if (name == null || name.isBlank()) {
      return "?";
    }
    var words = name.trim().split("\\s+");
    var initials = new StringBuilder();
    for (int i = 0; i < Math.min(2, words.length); i++) {
      initials.append(Character.toUpperCase(words[i].charAt(0)));
    }
    return initials.toString();
  }
}
