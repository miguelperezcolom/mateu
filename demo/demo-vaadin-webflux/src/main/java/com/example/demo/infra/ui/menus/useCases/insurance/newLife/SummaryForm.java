package com.example.demo.infra.ui.menus.useCases.insurance.newLife;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.*;
import lombok.Getter;
import lombok.Setter;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

@Getter
@Setter
@ReadOnly
public class SummaryForm {

  @Ignored
  private ContractForm contractForm;

  public SummaryForm(ContractForm contractForm) throws MalformedURLException {
    this.contractForm = contractForm;
  }

  public SummaryForm() throws MalformedURLException {}

  @Slot(SlotName.header)
  Stepper stepper =
      new Stepper(
              0.75,
              "Summary (Step 4 of 4)",
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
                          true,
                          false
                  ),
                  new StepperStep(
                          "summary",
                          "STEP 4",
                          "Summary",
                          false,
                          true
                  )
              )
      );

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

  @Label("Sum Insured")
  @CustomFieldStereotype("item")
  String sumInsured = "1.624,05 €";

  @Section("Payment Details")
  @CustomFieldStereotype("item")
  String paymentFrequency = "Monthly";

  @CustomFieldStereotype("item")
  String paymentMethod = "Bank transfer";

  @Label("IBAN")
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
            "Your application",
        ResultType.Success,
        "The application request was received successfully. It will take 24 hours to create on the list."
            + " You will receive a notification regarding the conclusion.",
        null,
        new Destination("home", DestinationType.Url, "Back to homepage", ""),
            null, null);
  }
}
