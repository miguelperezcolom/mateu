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
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.With;

import java.time.LocalDate;
import java.util.List;

@With@Builder
public record Dispo(
        @Section(value = "Filters", columns = 3)
        @ForeignKey(search = DestinationIdOptionsSupplier.class, label = DestinationLabelSupplier.class)
        @Colspan(2)
        @Style("width: 100%")
        @NotEmpty String destinationCode,
        LocalDate bookingDate,

        LocalDate checkin,
        int nights,
        LocalDate checkout,

        int rooms1,
        int adults1,
        int children1,

        int rooms2,
        int adults2,
        int children2,

        boolean useCurrentTariffs,
        boolean includeOnRequest,
        boolean ignoreClosedSales,

        @Section("Found")
        @ReadOnly
        List<HotelFound> results
        ) implements WizardStep, OptionsSupplier {

    @Override
    public List<Option> options(String fieldName, HttpRequest httpRequest) {
        return List.of();
    }
}