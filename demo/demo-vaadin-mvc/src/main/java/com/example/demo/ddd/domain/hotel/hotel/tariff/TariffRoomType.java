package com.example.demo.ddd.domain.hotel.hotel.tariff;

public record TariffRoomType(
        boolean assignPrices,
        String roomTypeCode,
        String roomTypeDescription,
        boolean base,
        int baseCapacity,
        int maxCapacity
) {
}
