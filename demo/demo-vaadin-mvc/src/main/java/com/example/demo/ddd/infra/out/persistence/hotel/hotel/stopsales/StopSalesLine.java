package com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales;

import io.mateu.core.infra.declarative.Entity;
import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.ReadOnly;

import java.time.LocalDate;

public record StopSalesLine(
        @GeneratedValue(UUIDValueGenerator.class)
        String id,
        @ReadOnly
        String hotelId,
        String roomTypeCode,
        LocalDate from,
        LocalDate to
) implements Entity<String> {
}
