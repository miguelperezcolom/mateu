package com.example.demo.ddd.domain.hotel.hotel.tariff;

public record TariffRoomOccupationType(
        String roomTypeCode,
        boolean active,
        boolean production,
        OccupationType occupationType,
        UseType useType
) {
}
