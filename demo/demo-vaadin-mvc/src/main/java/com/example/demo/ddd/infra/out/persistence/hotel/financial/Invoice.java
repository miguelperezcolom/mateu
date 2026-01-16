package com.example.demo.ddd.infra.out.persistence.hotel.financial;

import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.agency.AgencyLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.Booking;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.BookingRepository;
import io.mateu.core.infra.declarative.Entity;
import io.mateu.core.infra.valuegenerators.LocatorValueGenerator;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Status;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record Invoice(
        @GeneratedValue(LocatorValueGenerator.class)
        String id,
        @NotEmpty
        @ForeignKey(search = AgencyIdOptionsSupplier.class, label = AgencyLabelSupplier.class)
        String agencyId,
        @NotNull
        @ReadOnly
        LocalDate created,
        @NotNull
        @ReadOnly
        Amount total,
        @ReadOnly
        Status status,

        @Tab("Lines")
        List<InvoiceLine> lines
) implements Entity<String> {
}
