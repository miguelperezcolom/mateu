package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.PaxType;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.UseType;

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
