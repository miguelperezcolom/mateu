package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelLabelSupplier;
import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.uidl.annotations.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;
import lombok.With;

import java.time.LocalDate;
import java.util.List;

@Builder
@With
public record Offer(
        @Hidden
        @GeneratedValue(UUIDValueGenerator.class)
        String id,
        @NotEmpty
        String name,
        @ForeignKey(search = HotelIdOptionsSupplier.class, label = HotelLabelSupplier.class)
        @NotEmpty
        String hotelId,
        @ForeignKey(search = AgencyIdOptionsSupplier.class, label = AgencyLabelSupplier.class)
        String agencyId,
        boolean active,
        @Tab("Application terms")
        @HiddenInList
        LocalDate bookingWindowFrom,
        @HiddenInList
        LocalDate bookingWindowTo,

        @HiddenInList
        LocalDate checkinFrom,
        @HiddenInList
        LocalDate checkinTo,

        @HiddenInList
        LocalDate stayFrom,
        @HiddenInList
        LocalDate stayTo,

        @Tab("Benefits")
        @Colspan(2)
        List<Benefit> benefits
        ) implements GenericEntity {
}
