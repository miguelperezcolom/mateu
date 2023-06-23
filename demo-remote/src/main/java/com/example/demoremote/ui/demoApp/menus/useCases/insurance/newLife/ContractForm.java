package com.example.demoremote.ui.demoApp.menus.useCases.insurance.newLife;

import io.mateu.mdd.core.interfaces.HasStepper;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.Stepper;
import io.mateu.mdd.shared.data.StepperStep;
import io.mateu.mdd.shared.data.TelephoneNumber;
import jakarta.validation.constraints.NotNull;
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

    public ContractForm() {

    }

    @Slot(SlotName.header)
    Stepper stepper = io.mateu.mdd.shared.data.Stepper.builder()
                .value(0.5)
                .text("Contract (Step 3 of 4)")
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
                                .done(false)
                                .current(true)
                                .build()
                        , StepperStep.builder()
                                .id("summary")
                                .caption("STEP 4")
                                .description("Summary")
                                .done(false)
                                .current(false)
                                .build()
                ))
                .build();

    @Section("Bookingholders")
    @Caption("Is the bad person the bookingholder?")
    @UseRadioButtons
    boolean insuredPersonIsPolicyHolder = true;

    //@NotNull
    @i18n("LOK_GSGSGS_HSHSH")
    String firstName;

    //@NotNull
    String lastName;

    //@NotNull
    Gender Gender;

    //@NotNull
    AddressType addressType;

    //@NotNull
    String plz;

    @SameLine
    //@NotNull
    String ort;

    //@NotNull
    String strasse;

    //@NotNull
    @SameLine
    String hausnummer;

    //@NotNull
    String email;

    //@NotNull
    TelephoneNumber mobilePhoneNumber;

    TelephoneNumber phoneNumber;

    @Section("Payment information")
    //@NotNull
    PaymentFrequency paymentFrequency;

    //@NotNull
    @Caption("IBAN")
    String iban;

    //@NotNull
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
