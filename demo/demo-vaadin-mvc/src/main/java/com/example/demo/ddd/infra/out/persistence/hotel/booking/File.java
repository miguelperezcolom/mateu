package com.example.demo.ddd.infra.out.persistence.hotel.booking;

import io.mateu.core.infra.declarative.Entity;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyLabelSupplier;
import io.mateu.core.infra.valuegenerators.LocatorValueGenerator;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Status;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record File(
        @GeneratedValue(LocatorValueGenerator.class)
        String id,
        @NotEmpty
        @ForeignKey(search = AgencyIdOptionsSupplier.class, label = AgencyLabelSupplier.class)
        String agencyId,
        @NotEmpty
        String name,
        @NotNull
        @ReadOnly
        LocalDate created,
        @NotNull
        @KPI
        Amount total,
        @ReadOnly
        Status status,

        @Tab("Bookings")
        @Composition(targetClass = Booking.class, repositoryClass = BookingRepository.class, foreignKeyField = "fileId")
                @Label("")
        List<String> bookingIds
) implements Entity<String> {
}
