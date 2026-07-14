package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Meter;
import io.mateu.uidl.fluent.Component;

/** Demo of the {@link Meter} component: guest balance vs preauthorization. */
@UI("/meter-demo")
@Title("Balance meter")
public class BalanceMeter {

  @Section("Balance")
  Component balance =
      Meter.builder()
          .label("BALANCE ACTUAL")
          .value(1240.0)
          .max(1800.0)
          .unit("€")
          .caption("69% de la preautorización consumido")
          .warnAt(1440.0)
          .dangerAt(1710.0)
          .build();
}
