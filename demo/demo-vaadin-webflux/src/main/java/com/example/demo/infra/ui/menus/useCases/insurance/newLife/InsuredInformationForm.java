package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.Stepper;
import io.mateu.uidl.data.StepperStep;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Title("Bad life sale")
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

  @Label("Is yur customer a smoker?")
  @UseRadioButtons
  boolean smoker = false;

  Double sumInsured;

  @Label("Would you like to add a co-habitant?")
  @UseRadioButtons
  boolean addCoinsured = false;

  @Section("Contract")
  LocalDate startDate;

  @Placeholder("Select months")
  int duration;

  LocalDate endDate;

  PaymentFrequency paymentFrequency;

  CapitalFlowType capitalFlowType;

  @Label("Capital Flow %")
  double capitalFlowPercent;

  @Slot(SlotName.right)
  InsuredInformationSummary summary = new InsuredInformationSummary();

  @MainAction
  public PriceSelectionForm calculate() {
    return new PriceSelectionForm(this);
  }
}
