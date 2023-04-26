package com.example.demoremote.ui.demoApp.menus.useCases.insurance.newLife;

import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.*;
import lombok.Getter;
import lombok.Setter;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.LocalDate;
import java.util.List;

@Getter@Setter@ReadOnly
public class SummaryForm {

    @Ignored
    private ContractForm contractForm;

    public SummaryForm(ContractForm contractForm) throws MalformedURLException {
        this.contractForm = contractForm;
    }

    public SummaryForm() throws MalformedURLException {
    }

    @Section(value = "", card = false)
    Stepper stepper = Stepper.builder()
            .value(0.75)
            .text("Summary (Step 4 of 4)")
            .steps(List.of(
                    StepperStep.builder()
                            .id("calculation")
                            .caption("STEP 1")
                            .description("Insured Information")
                            .done(true)
                            .current(false)
                            .build()
                    , StepperStep.builder()
                            .id("priceSelection")
                            .caption("STEP 2")
                            .description("Price Selection")
                            .done(true)
                            .current(false)
                            .build()
                    , StepperStep.builder()
                            .id("contract")
                            .caption("STEP 3")
                            .description("Contract")
                            .done(true)
                            .current(false)
                            .build()
                    , StepperStep.builder()
                            .id("summary")
                            .caption("STEP 4")
                            .description("Summary")
                            .done(false)
                            .current(true)
                            .build()
            ))
            .build();



    @Slot(SlotName.right)
    PriceSelectionSummary summary;

    @Section("Application information")
    URL applicationNumber = new URL("https://google.es");
    String carrier;
    String startDate;
    String endDate;

    @Section("Customer Information")
    String customerName;
    String birthDate;
    String smoker;
    @Caption("sum-insured")
    String sumInsured;

    @Section("Payment Details")
    String paymentFrequency;
    String paymentMethod;
    @Caption("IBAN")
    String iban;
    String accountHolder;



    @MainAction(type = ActionType.Secondary)
    public void saveAsDraft() {
        System.out.println("saved as draft");
    }

    @MainAction
    public Result applicate() {
        return new Result(ResultType.Success,
                "The application request was received successfully. It will take 24 hours to create on the list." +
                        " You will receive a notification regarding the conclusion.",
                null, new Destination(DestinationType.Url, "Back to homepage", ""));
    }

}
