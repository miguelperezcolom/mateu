package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff;

public record TariffRoomOccupationType(
        String roomTypeCode,
        boolean active,
        boolean production,
        OccupationType occupationType,
        UseType useType
) {
}
