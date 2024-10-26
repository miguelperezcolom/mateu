package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.*;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Caption;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.Stepper;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.StepperStep;
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
      new Stepper(
              0,
              "Bad guy Information (Step 1 of 4)",
              List.of(
                  new StepperStep(
                          "calculation",
                          "STEP 1",
                          "Insured Information",
                          false,
                          true
                  ),
                  new StepperStep(
                          "priceSelection",
                          "STEP 2",
                          "Price Selection",
                          false,
                          false
                  ),
                  new StepperStep(
                          "contract",
                          "STEP 3",
                          "Contract",
                          false,
                          false
                  ),
                  new StepperStep(
                          "summary",
                          "STEP 4",
                          "Summary",
                          false,
                          false
                  )
              )
          );

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
