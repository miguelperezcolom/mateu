package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods;

import java.time.LocalDate;

public record Period(
        int number,
        LocalDate from,
        LocalDate to,
        String comments
) {
}
