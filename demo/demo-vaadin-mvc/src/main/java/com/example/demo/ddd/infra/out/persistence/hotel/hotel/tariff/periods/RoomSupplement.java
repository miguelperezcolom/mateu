package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods;

public record RoomSupplement(
        String roomTypeCode,
        int periodNumber,
        String calculationBaseRoomTypeCode,
        double increment,
        double percent,
        String comment
) {
}
