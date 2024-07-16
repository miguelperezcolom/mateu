package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ComplexKey;
import io.mateu.mdd.shared.data.Stepper;
import io.mateu.mdd.shared.data.StepperStep;
import io.mateu.mdd.shared.interfaces.ComplexKeyChoice;
import io.mateu.mdd.shared.interfaces.ComplexKeyOption;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PriceSelectionForm {

  @Ignored private InsuredInformationForm insuredInformationForm;

  public PriceSelectionForm(InsuredInformationForm insuredInformationForm) {
    this.insuredInformationForm = insuredInformationForm;
  }

  public PriceSelectionForm() {}

  @Slot(SlotName.header)
  Stepper stepper =
      Stepper.builder()
          .value(0.25)
          .text("Price Selection (Step 2 of 4)")
          .steps(
              List.of(
                  StepperStep.builder()
                      .id("calculation")
                      .caption("STEP 1")
                      .description("Insured Information")
                      .done(true)
                      .current(false)
                      .build(),
                  StepperStep.builder()
                      .id("priceSelection")
                      .caption("STEP 2")
                      .description("Price Selection")
                      .done(false)
                      .current(true)
                      .build(),
                  StepperStep.builder()
                      .id("contract")
                      .caption("STEP 3")
                      .description("Contract")
                      .done(false)
                      .current(false)
                      .build(),
                  StepperStep.builder()
                      .id("summary")
                      .caption("STEP 4")
                      .description("Summary")
                      .done(false)
                      .current(false)
                      .build()))
          .build();

  @Section(value = "", card = false)
  @NotNull
  ComplexKeyChoice carrier =
      new ComplexKeyChoice() {
        @Override
        public List<ComplexKeyOption> getOptions() {
          return List.of(
              ComplexKeyOption.builder()
                  .key(
                      ComplexKey.builder()
                          .title("Carrier 1")
                          .text(
                              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                  + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                  + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                  + "commodo consequat")
                          .note("Payment end date 24.02.2023")
                          .summary("<b>12,20€</b> / Month")
                          .build())
                  .value("1")
                  .build(),
              ComplexKeyOption.builder()
                  .key(
                      ComplexKey.builder()
                          .title("Carrier 2")
                          .text(
                              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                  + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                  + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                  + "commodo consequat")
                          .note("Payment end date 24.02.2023")
                          .summary("<b>19,10€</b> / Month")
                          .build())
                  .value("2")
                  .build(),
              ComplexKeyOption.builder()
                  .key(
                      ComplexKey.builder()
                          .title("Carrier 3")
                          .text(
                              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                  + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                  + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                  + "commodo consequat")
                          .note("Payment end date 24.02.2023")
                          .summary("<b>24,12€</b> / Month")
                          .build())
                  .value("3")
                  .build(),
              ComplexKeyOption.builder()
                  .key(
                      ComplexKey.builder()
                          .title("Carrier 4")
                          .text(
                              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                  + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                  + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                  + "commodo consequat")
                          .note("Payment end date 24.02.2023")
                          .summary("<b>36,00€</b> / Month")
                          .build())
                  .value("4")
                  .build());
        }
      }.setValue("2");

  @Slot(SlotName.right)
  PriceSelectionSummary summary = new PriceSelectionSummary();

  @MainAction("Continue")
  public ContractForm goToNextPage() {
    return new ContractForm(this);
  }
}
