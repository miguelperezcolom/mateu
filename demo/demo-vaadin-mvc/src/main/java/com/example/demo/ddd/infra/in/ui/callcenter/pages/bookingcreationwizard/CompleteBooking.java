package com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard;

import io.mateu.core.infra.declarative.WizardStep;

import java.time.LocalDate;

public record CompleteBooking(
        String leadName,
        String specialRequests
) implements WizardStep {
}
