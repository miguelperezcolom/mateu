package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.PaxType;

public record TariffRoomPaxSupplement(
        String roomCode,
        PaxType paxType,
        UseType useType,
        int ageFrom,
        int ageTo,
        double price,
        boolean baseBased,
        String comments
) {
}
