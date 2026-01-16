package com.example.demo.ddd.infra.out.persistence.hotel.financial;

import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.FileIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.FileLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelLabelSupplier;
import io.mateu.core.infra.declarative.Entity;
import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.core.infra.valuegenerators.LocatorValueGenerator;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.data.Amount;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record Payment(
        @GeneratedValue(LocatorValueGenerator.class)
        String id,
        @NotEmpty
        @ForeignKey(search = AgencyIdOptionsSupplier.class, label = AgencyLabelSupplier.class)
        String agencyId,
        @NotNull
        LocalDate date,
        Amount amount,
        String comments
)  implements Entity<String> {
}
