package com.example.demo.ddd.domain.hotel.hotel.tariff;

public record TariffBoard(
        boolean assignPrices,
        String boardCode,
        String boardName,
        BoardType boardType
) {
}
