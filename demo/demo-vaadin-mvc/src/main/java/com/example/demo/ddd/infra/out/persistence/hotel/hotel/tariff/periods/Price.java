package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record Price(
        int number,
        int periodNumber,
        List<PricePerRoom> pricePerRoom,
        String comments
) {
}
