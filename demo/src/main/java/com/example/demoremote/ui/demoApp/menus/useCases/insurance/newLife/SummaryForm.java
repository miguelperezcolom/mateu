package com.example.demoremote.ui.demoApp.menus.useCases.insurance.newLife;

import io.mateu.mdd.shared.annotations.*;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

import io.mateu.mdd.shared.data.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ReadOnly
public class SummaryForm {

  @Ignored private ContractForm contractForm;

  public SummaryForm(ContractForm contractForm) throws MalformedURLException {
    this.contractForm = contractForm;
  }

  public SummaryForm() throws MalformedURLException {}

  @Slot(SlotName.header)
  Stepper stepper =
      Stepper.builder()
          .value(0.75)
          .text("Summary (Step 4 of 4)")
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
                      .done(true)
                      .current(false)
                      .build(),
                  StepperStep.builder()
                      .id("contract")
                      .caption("STEP 3")
                      .description("Contract")
                      .done(true)
                      .current(false)
                      .build(),
                  StepperStep.builder()
                      .id("summary")
                      .caption("STEP 4")
                      .description("Summary")
                      .done(false)
                      .current(true)
                      .build()))
          .build();

  @Slot(SlotName.right)
  PriceSelectionSummary summary = new PriceSelectionSummary();

  @Section("Application information")
  URL applicationNumber = new URL("https://google.es");

  @CustomFieldStereotype("item")
  String carrier = "AXA";

  @CustomFieldStereotype("item")
  String startDate = "2024-01-01";

  @CustomFieldStereotype("item")
  String endDate = "2024-12-01";

  @Section("Customer Information")
  @CustomFieldStereotype("item")
  String customerName = "Gabriel Núñez";

  @CustomFieldStereotype("item")
  String birthDate = "27-11-1975";

  @CustomFieldStereotype("item")
  String smoker = "No";

  @Caption("Sum Insured")
  @CustomFieldStereotype("item")
  String sumInsured = "1.624,05 €";

  @Section("Payment Details")
  @CustomFieldStereotype("item")
  String paymentFrequency = "Monthly";

  @CustomFieldStereotype("item")
  String paymentMethod = "Bank transfer";

  @Caption("IBAN")
  @CustomFieldStereotype("item")
  String iban = "ES 001 12345 12345 12345";

  @CustomFieldStereotype("item")
  String accountHolder = "Gabriel Núñez";

  @MainAction(type = ActionType.Secondary)
  public void saveAsDraft() {
    System.out.println("saved as draft");
  }

  @MainAction
  public Result applicate() {
    return new Result(
        ResultType.Success,
        "The application request was received successfully. It will take 24 hours to create on the list."
            + " You will receive a notification regarding the conclusion.",
        null,
        new Destination(DestinationType.Url, "Back to homepage", ""),
            null);
  }
}
