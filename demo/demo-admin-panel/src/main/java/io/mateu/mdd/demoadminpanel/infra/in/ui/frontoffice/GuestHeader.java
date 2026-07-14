package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link EntityHeader} component: the guest banner of a check-in flow. */
@UI("/entity-header-demo")
@Title("Guest header")
public class GuestHeader {

  @Section("Guest")
  Component guest =
      EntityHeader.builder()
          .title("María Fernández")
          .badges(List.of(Chip.builder().label("PLATINUM").color("contrast").build()))
          .subtitle("Ocean Suite · 30 Apr → 07 May · 7N · 2pax · All Inclusive")
          .facts(
              List.of(
                  Fact.builder().label("TOTAL RESERVA").value("€ 4.890,00").build(),
                  Fact.builder().label("AGENCIA").value("TUI Group · TUI Magic Life").build()))
          .metricLabel("FIDELIDAD")
          .metricValue("48.500")
          .metricCaption("23 estancias")
          .build();
}
