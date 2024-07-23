package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.domain.uidefinition.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.data.Stepper;
import io.mateu.core.domain.uidefinition.shared.data.StepperStep;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Caption("Bad life sale")
public class InsuredInformationForm {

  @Slot(SlotName.header)
  Stepper stepper =
      Stepper.builder()
          .value(0)
          .text("Bad guy Information (Step 1 of 4)")
          .steps(
              List.of(
                  StepperStep.builder()
                      .id("calculation")
                      .caption("STEP 1")
                      .description("Insured Information")
                      .done(false)
                      .current(true)
                      .build(),
                  StepperStep.builder()
                      .id("priceSelection")
                      .caption("STEP 2")
                      .description("Price Selection")
                      .done(false)
                      .current(false)
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

  @Section("Known Persons")
  LocalDate birthDate;

  @Caption("Is yur customer a smoker?")
  @UseRadioButtons
  boolean smoker = false;

  Double sumInsured;

  @Caption("Would you like to add a co-habitant?")
  @UseRadioButtons
  boolean addCoinsured = false;

  @Section("Contract")
  LocalDate startDate;

  @Placeholder("Select months")
  int duration;

  LocalDate endDate;

  PaymentFrequency paymentFrequency;

  CapitalFlowType capitalFlowType;

  @Caption("Capital Flow %")
  double capitalFlowPercent;

  @Slot(SlotName.right)
  InsuredInformationSummary summary = new InsuredInformationSummary();

  @MainAction
  public PriceSelectionForm calculate() {
    return new PriceSelectionForm(this);
  }
}
