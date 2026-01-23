package com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard;

import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryCodeOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationLabelSupplier;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.mateu.core.infra.declarative.WizardStep;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Button;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.With;

import java.time.LocalDate;
import java.util.List;

@With@Builder
public record Dispo(
        @Section(value = "Filters", columns = 4)
        @ForeignKey(search = DestinationIdOptionsSupplier.class, label = DestinationLabelSupplier.class)
        @Colspan(4)
        @NotEmpty String destinationCode,
        LocalDate checkin,
        int nights,
        @Colspan(2)
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
        @Colspan(2)
        boolean ignoreClosedSales,

        Button search,

        @Section("Found")
        @ReadOnly
        List<HotelFound> results
        ) implements WizardStep {
    public Dispo(
            @Colspan(4)
            @NotEmpty String destinationCode, int children1, int[] ages1, int rooms2, int adults2, int children2, int[] ages2, int rooms3, int adults3, int children3, int[] ages3, LocalDate bookingDate, boolean includeOnRequest, boolean ignoreClosedSales,
            List<HotelFound> results, Button search) {
        this(destinationCode, LocalDate.now().plusDays(7), 7, LocalDate.now().plusDays(14), 0, 0, children1, ages1, rooms2, adults2, children2, ages2, rooms3, adults3, children3, ages3, bookingDate, includeOnRequest, ignoreClosedSales,
                Button.builder()
                        .label("Search")
                        .actionId("search")
                        .build(), results);

    }
}