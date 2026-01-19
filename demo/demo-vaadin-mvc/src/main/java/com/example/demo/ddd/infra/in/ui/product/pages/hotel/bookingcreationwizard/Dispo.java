package com.example.demo.ddd.infra.in.ui.product.pages.hotel.bookingcreationwizard;

import io.mateu.core.infra.declarative.WizardStep;
import jakarta.validation.constraints.NotEmpty;

import java.time.LocalDate;
import java.util.List;

public record Dispo(
        @NotEmpty String destinationCode,
        LocalDate checkin,
        int nights,
        LocalDate checkout,
        int rooms1,
        int adults1,
        int children1,
        int[] ages1,
        int rooms2,
        int adults2,
        int children2,
        int[] ages2,
        int rooms3,
        int adults3,
        int children3,
        int[] ages3,
        LocalDate bookingDate,
        boolean includeOnRequest,
        boolean ignoreClosedSales,
        List<HotelFound> results
        ) implements WizardStep {
}
