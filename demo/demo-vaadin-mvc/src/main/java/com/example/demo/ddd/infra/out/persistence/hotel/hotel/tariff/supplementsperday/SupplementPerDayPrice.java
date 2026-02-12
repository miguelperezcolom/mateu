package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.supplementsperday;

import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Label;

import java.time.LocalDate;

@FormLayout(columns = 5)
public record SupplementPerDayPrice(
        LocalDate from,
        LocalDate to,
        String roomTypeCode,
        double increment,
        double percent,
        @ColumnWidth("3rem")
        @Label("M")
        boolean appliesOnMonday,
        @ColumnWidth("3rem")
        @Label("T")
        boolean appliesOnTuesday,
        @ColumnWidth("3rem")
        @Label("W")
        boolean appliesOnWednesday,
        @ColumnWidth("3rem")
        @Label("R")
        boolean appliesOnThursday,
        @ColumnWidth("3rem")
        @Label("F")
        boolean appliesOnFriday,
        @ColumnWidth("3rem")
        @Label("S")
        boolean appliesOnSaturday,
        @ColumnWidth("3rem")
        @Label("U")
        boolean appliesOnSunday
) {
}
