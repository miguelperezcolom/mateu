package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.uidl.core.annotations.*;
import io.mateu.uidl.core.data.Stepper;
import io.mateu.uidl.core.data.StepperStep;
import io.mateu.uidl.core.data.TelephoneNumber;
import lombok.Getter;
import lombok.Setter;

import java.net.MalformedURLException;
import java.util.List;

@Getter
@Setter
public class ContractForm {

  @Ignored
  PriceSelectionForm priceSelectionForm;

  public ContractForm(PriceSelectionForm priceSelectionForm) {
    this.priceSelectionForm = priceSelectionForm;
  }

  public ContractForm() {}

  @Slot(SlotName.header)
  Stepper stepper =
      new Stepper(
              0.5,
              "Contract (Step 3 of 4)",
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
                          true,
                          false
                  ),
                  new StepperStep(
                          "contract",
                          "STEP 3",
                          "Contract",
                          false,
                          true
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

  @Section("Bookingholders")
  @Caption("Is the bad person the bookingholder?")
  @UseRadioButtons
  boolean insuredPersonIsPolicyHolder = true;

  // @NotNull
  String firstName;

  // @NotNull
  String lastName;

  // @NotNull
  Gender Gender;

  // @NotNull
  AddressType addressType;

  // @NotNull
  String plz;

  @SameLine
  // @NotNull
  String ort;

  // @NotNull
  String strasse;

  // @NotNull
  @SameLine String hausnummer;

  // @NotNull
  String email;

  // @NotNull
  TelephoneNumber mobilePhoneNumber;

  TelephoneNumber phoneNumber;

  @Section("Payment information")
  // @NotNull
  PaymentFrequency paymentFrequency;

  // @NotNull
  @Caption("IBAN")
  String iban;

  // @NotNull
  String accountHolderName;

  @Section("Friends")
  @Caption("Do you have a friend?")
  @UseRadioButtons
  boolean hasBeneficiary;

  @Slot(SlotName.right)
  PriceSelectionSummary summary = new PriceSelectionSummary();

  @MainAction(type = ActionType.Secondary, validateBefore = false)
  public void saveAsDraft() {
    System.out.println("saved as draft");
  }

  @MainAction
  public SummaryForm startApplication() throws MalformedURLException {
    return new SummaryForm(this);
  }
}
