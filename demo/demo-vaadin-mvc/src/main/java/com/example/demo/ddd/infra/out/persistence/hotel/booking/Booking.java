package com.example.demo.ddd.infra.out.persistence.hotel.booking;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelLabelSupplier;
import io.mateu.core.infra.valuegenerators.LocatorValueGenerator;
import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record Booking(
        @GeneratedValue(LocatorValueGenerator.class)
        String id,
        @NotEmpty
        @ForeignKey(search = AgencyIdOptionsSupplier.class, label = AgencyLabelSupplier.class)
        String agencyId,
        @NotEmpty
        @ForeignKey(search = HotelIdOptionsSupplier.class, label = HotelLabelSupplier.class)
        String hotelId,
        @NotNull
        LocalDate checkin,
        @NotNull
        LocalDate checkout,
        @NotEmpty
        String name,
        String comments
) implements GenericEntity {
}
