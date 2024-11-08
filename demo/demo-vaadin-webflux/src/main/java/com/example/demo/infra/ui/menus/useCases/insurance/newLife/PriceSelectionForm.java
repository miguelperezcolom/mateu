package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.ComplexKey;
import io.mateu.uidl.data.Stepper;
import io.mateu.uidl.data.StepperStep;
import io.mateu.uidl.interfaces.ComplexKeyChoice;
import io.mateu.uidl.interfaces.ComplexKeyOption;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PriceSelectionForm {

  @Ignored
  private InsuredInformationForm insuredInformationForm;

  public PriceSelectionForm(InsuredInformationForm insuredInformationForm) {
    this.insuredInformationForm = insuredInformationForm;
  }

  public PriceSelectionForm() {}

  @Slot(SlotName.header)
  Stepper stepper =
      new Stepper(
              0.25,
              "Price Selection (Step 2 of 4)",
              List.of(
                  new StepperStep(
                          "calculation",
                          "STEP 1",
                          "Insured Information",
                          true,
                          false
                  ),
                  new StepperStep(
                          "priceSelection",
                          "STEP 2",
                          "Price Selection",
                          false,
                          true
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
                      ));

  @Section(value = "", card = false)
  @NotNull
  ComplexKeyChoice carrier =
      new ComplexKeyChoice(null, List.of(
                  new ComplexKeyOption(
                          new ComplexKey(
                                  "Carrier 1",
                                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                          + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                          + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                          + "commodo consequat",
                                  "Payment end date 24.02.2023",
                                  "<b>12,20€</b> / Month"
                          ),
                          "1"
                  ),
                  new ComplexKeyOption(
                          new ComplexKey(
                                  "Carrier 2",
                                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                          + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                          + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                          + "commodo consequat",
                                  "Payment end date 24.02.2023",
                                  "<b>19,10€</b> / Month"
                          ),
                          "2"
                  ),
                  new ComplexKeyOption(
                          new ComplexKey(
                                  "Carrier 3",
                                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                          + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                          + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                          + "commodo consequat",
                                  "Payment end date 24.02.2023",
                                  "<b>24,12€</b> / Month"
                          ),
                          "3"
                  ),
                  new ComplexKeyOption(
                          new ComplexKey(
                                  "Carrier 4",
                                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
                                          + "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim "
                                          + "veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea "
                                          + "commodo consequat",
                                  "Payment end date 24.02.2023",
                                  "<b>36,00€</b> / Month"
                          ),
                          "4"
                  )));

  @Slot(SlotName.right)
  PriceSelectionSummary summary = new PriceSelectionSummary();

  @MainAction("Continue")
  public ContractForm goToNextPage() {
    return new ContractForm(this);
  }
}
