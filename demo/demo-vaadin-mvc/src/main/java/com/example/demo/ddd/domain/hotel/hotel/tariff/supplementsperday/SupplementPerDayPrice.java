package com.example.demo.ddd.domain.hotel.hotel.tariff.supplementsperday;

import java.time.LocalDate;

public record SupplementPerDayPrice(
        LocalDate from,
        LocalDate to,
        String roomTypeCode,
        double increment,
        double percent,
        boolean appliesOnMonday,
        boolean appliesOnTuesday,
        boolean appliesOnWednesday,
        boolean appliesOnThursday,
        boolean appliesOnFriday,
        boolean appliesOnSaturday,
        boolean appliesOnSunday
) {
}
