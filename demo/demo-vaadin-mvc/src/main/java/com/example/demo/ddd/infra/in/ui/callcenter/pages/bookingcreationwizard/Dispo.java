package com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard;

import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryCodeOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationLabelSupplier;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.mateu.core.infra.declarative.WizardStep;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.With;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ButtonComponentToDtoMapper.mapButtonToDto;

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
        @Style("min-width: 40rem; width: 100%;")
        List<HotelFound> results
        ) implements WizardStep, OptionsSupplier {

    @Override
    public List<Option> options(String fieldName, HttpRequest httpRequest) {
        return List.of();
    }


    @Toolbar
    public Dispo search() {
        return this.withResults(List.of(
                new HotelFound(
                        "1",
                        "HOTEL RIU CONCORDIA",
                        "/images/hotels/h-102.jpg",
                        100.2,
                        "oo",
                        "cc",
                        false,
                        ColumnAction.builder()
                                .label("Select")
                                .methodNameInCrud("select")
                                .build())
                ,
                new HotelFound(
                        "2",
                        "HOTEL RIU LA MOLA",
                        "/images/hotels/h-105.jpg",
                        200.32,
                        "oo",
                        "cc",
                        false,
                        ColumnAction.builder()
                                .label("Select")
                                .methodNameInCrud("select")
                                .build())
                )
        );
    }

}