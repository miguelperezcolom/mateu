package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.OfferCard;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link OfferCard} component: assigned room vs available upgrade. */
@UI("/offer-card-demo")
@Title("Room offers")
public class SuiteUpgrade {

  @Section("Tu habitación y mejoras")
  Component offers =
      HorizontalLayout.builder()
          .spacing(true)
          .wrap(true)
          .content(
              List.of(
                  OfferCard.builder()
                      .id("assigned")
                      .tag("HABITACIÓN ASIGNADA")
                      .title("Ocean Suite")
                      .subtitle("Planta 12 · Vista lateral al mar")
                      .features(List.of("48 m²", "Balcón", "Cama king", "Minibar"))
                      .current(true)
                      .currentLabel("✓ Incluida en tu reserva")
                      .build(),
                  OfferCard.builder()
                      .id("upgrade")
                      .tag("UPGRADE DISPONIBLE")
                      .title("Master Oceanfront Suite")
                      .subtitle("Planta 14 · Primera línea")
                      .features(
                          List.of("68 m²", "Vista mar frontal", "Terraza + jacuzzi", "Sofá lounge"))
                      .priceLabel("+ € 65 / noche")
                      .actionLabel("Mejorar a esta habitación")
                      .actionId("upgrade")
                      .build()))
          .build();

  @Action
  Object upgrade() {
    return new Message("This would upgrade the reservation to the Master Oceanfront Suite");
  }
}
