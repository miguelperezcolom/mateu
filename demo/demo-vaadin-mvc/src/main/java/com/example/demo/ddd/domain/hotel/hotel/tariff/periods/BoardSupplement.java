package com.example.demo.ddd.domain.hotel.hotel.tariff.periods;

import com.example.demo.ddd.domain.hotel.codes.PaxType;

public record BoardSupplement(
        String roomTypeCode,
        int periodNumber,
        PaxType pax,
        int childAgeRangeNumber,
        String boardTypeCode,
        double increment,
        double percent,
        String comment
) {
}
