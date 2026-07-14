package io.mateu.mdd.demoadminpanel.infra.in.ui.funnel;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Funnel;
import io.mateu.uidl.data.FunnelStage;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link Funnel} component: a signup conversion funnel. */
@UI("/funnel-demo")
@Title("Conversion")
public class ConversionFunnel {

  @Section("Signup funnel")
  Component funnel =
      Funnel.builder()
          .stages(
              List.of(
                  FunnelStage.builder().label("Visited").value(12500).color("#3b82f6").build(),
                  FunnelStage.builder().label("Signed up").value(4200).color("#8b5cf6").build(),
                  FunnelStage.builder().label("Activated").value(1800).color("#f59e0b").build(),
                  FunnelStage.builder().label("Paid").value(640).color("#10b981").build()))
          .build();
}
