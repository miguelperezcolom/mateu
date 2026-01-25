package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.SeasonIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.SeasonLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryCodeOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelLabelSupplier;
import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.Hidden;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record Contract(
        @Hidden
        @GeneratedValue(UUIDValueGenerator.class)
        String id,
        @NotEmpty
        String name,
        @ForeignKey(search = HotelIdOptionsSupplier.class, label = HotelLabelSupplier.class)
        @NotEmpty
        String hotelId,
        @ForeignKey(search = AgencyIdOptionsSupplier.class, label = AgencyLabelSupplier.class)
        @NotEmpty
        String agencyId,
        @ForeignKey(search = SeasonIdOptionsSupplier.class, label = SeasonLabelSupplier.class)
        @NotEmpty
        String seasonId
) implements GenericEntity {
}
