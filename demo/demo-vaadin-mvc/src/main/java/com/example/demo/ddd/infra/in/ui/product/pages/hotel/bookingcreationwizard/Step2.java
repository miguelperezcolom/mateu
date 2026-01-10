package com.example.demo.ddd.infra.in.ui.product.pages.hotel.bookingcreationwizard;

import io.mateu.core.infra.declarative.WizardStep;

public record Step2(String address, String country) implements WizardStep {
}
