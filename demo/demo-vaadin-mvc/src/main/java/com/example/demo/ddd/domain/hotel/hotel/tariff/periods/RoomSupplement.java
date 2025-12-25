package com.example.demo.ddd.domain.hotel.hotel.tariff.periods;

public record RoomSupplement(
        String roomTypeCode,
        int periodNumber,
        String calculationBaseRoomTypeCode,
        double increment,
        double percent,
        String comment
) {
}
