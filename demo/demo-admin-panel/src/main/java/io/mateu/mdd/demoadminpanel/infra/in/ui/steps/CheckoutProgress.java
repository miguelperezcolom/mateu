package io.mateu.mdd.demoadminpanel.infra.in.ui.steps;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ProgressSteps;
import io.mateu.uidl.data.Step;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link ProgressSteps} component: a checkout progress indicator. */
@UI("/steps-demo")
@Title("Checkout")
public class CheckoutProgress {

  @Section("Progress")
  Component progress =
      ProgressSteps.builder()
          .steps(
              List.of(
                  Step.builder().title("Cart").description("3 items").status("done").build(),
                  Step.builder().title("Address").description("Madrid").status("done").build(),
                  Step.builder()
                      .title("Payment")
                      .description("Enter your card")
                      .status("current")
                      .build(),
                  Step.builder().title("Review").status("upcoming").build(),
                  Step.builder().title("Done").status("upcoming").build()))
          .build();
}
