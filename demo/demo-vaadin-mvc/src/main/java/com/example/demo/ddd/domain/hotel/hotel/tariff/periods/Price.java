package com.example.demo.ddd.domain.hotel.hotel.tariff.periods;

import java.time.LocalDate;
import java.util.Map;

public record Price(
        int number,
        int periodNumber,
        Map<String, Double> pricePerRoom,
        String comments
) {
}
