package com.example.demo.ddd.infra.in.ui.product.pages.hotel.bookingcreationwizard;

import io.mateu.core.infra.declarative.WizardStep;
import jakarta.validation.constraints.NotEmpty;

public record Step1(@NotEmpty String name, int age) implements WizardStep {
}
