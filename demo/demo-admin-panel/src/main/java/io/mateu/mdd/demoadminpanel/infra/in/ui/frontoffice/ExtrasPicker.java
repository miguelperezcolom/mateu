package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AddOn;
import io.mateu.uidl.data.AddOnPicker;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link AddOnPicker} component: priced stay extras with a running total. */
@UI("/addon-picker-demo")
@Title("Extras")
public class ExtrasPicker {

  @Section("Extras de la estancia")
  Component extras =
      AddOnPicker.builder()
          .totalLabel("Añadidos")
          .currency("€")
          .actionId("extrasChanged")
          .items(
              List.of(
                  AddOn.builder()
                      .id("allinc")
                      .icon("🍹")
                      .title("Paquete All Inclusive")
                      .description("Todo incluido · 7 noches · 2 pax")
                      .price(343.0)
                      .unit("estancia")
                      .build(),
                  AddOn.builder()
                      .id("parking")
                      .icon("🅿")
                      .title("Parking")
                      .description("Cubierto · Vigilancia 24h")
                      .includedLabel("Incluido Platinum")
                      .build(),
                  AddOn.builder()
                      .id("spa")
                      .icon("💆")
                      .title("Circuito Spa")
                      .description("2 pax · 90 minutos")
                      .price(78.0)
                      .unit("sesión")
                      .build(),
                  AddOn.builder()
                      .id("late")
                      .icon("🕕")
                      .title("Late check-out")
                      .description("Hasta las 18:00h")
                      .price(40.0)
                      .added(true)
                      .build()))
          .build();

  @Action
  Object extrasChanged() {
    return new Message("Extras updated");
  }
}
