package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods;

import java.time.LocalDate;
import java.util.Map;

public record Price(
        int number,
        int periodNumber,
        Map<String, Double> pricePerRoom,
        String comments
) {
}
