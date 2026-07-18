package io.mateu.mdd.redwoodshowcase.ui.booking;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

record StayStep(
        @Section(value = "Your stay", columns = 2) @NotNull LocalDate checkIn,
        @NotNull LocalDate checkOut,
        int guests)
        implements WizardStep {}

record GuestStep(
        @Section(value = "Lead guest", columns = 2) @NotEmpty String fullName,
        @Email String email,
        String phone)
        implements WizardStep {}

record ExtrasStep(
        @Section("Extras") boolean breakfast, boolean parking, boolean lateCheckout)
        implements WizardStep {}

@ReadOnly
class BookingConfirmation implements WizardStep {
    @Text(size = io.mateu.uidl.data.TextSize.l)
    String message = "Booking confirmed!";

    String reference;
}

/**
 * Guided booking flow rendered with the Redwood "Guided Process" rail
 * ({@link WizardProgressStyle#RAIL}) — a sticky right-hand step rail beside the form.
 */
@UI("/booking")
@Title("New booking")
@WizardProgress(WizardProgressStyle.RAIL)
public class BookingWizard extends Wizard {

    StayStep stay;

    GuestStep guest;

    ExtrasStep extras;

    BookingConfirmation confirmation;

    @WizardCompletionAction
    void confirm() {
        confirmation = new BookingConfirmation();
        confirmation.reference = "BK-" + (guest != null && guest.fullName() != null
                ? Integer.toHexString(guest.fullName().hashCode()).toUpperCase()
                : "000000");
        confirmation.message = "Thanks"
                + (guest != null && guest.fullName() != null ? ", " + guest.fullName() : "")
                + "! Your booking is confirmed.";
    }
}
