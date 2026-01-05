package com.example.demo.ddd.infra.in.ui.pages.hotel.bookingcreationwizard;

import io.mateu.core.infra.declarative.WizardStep;

import java.time.LocalDate;

public record Step3(LocalDate checkin, LocalDate checkout) implements WizardStep {
}
