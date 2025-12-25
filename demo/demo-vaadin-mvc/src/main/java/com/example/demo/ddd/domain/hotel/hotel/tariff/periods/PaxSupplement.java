package com.example.demo.ddd.domain.hotel.hotel.tariff.periods;

import com.example.demo.ddd.domain.hotel.codes.PaxType;
import com.example.demo.ddd.domain.hotel.hotel.tariff.UseType;

public record PaxSupplement(
        String roomCode,
        int periodNumber,
        UseType useType,
        PaxType paxType,
        int childAgeRangeNumber,
        double increment,
        double percent,
        String comment
) {
}
