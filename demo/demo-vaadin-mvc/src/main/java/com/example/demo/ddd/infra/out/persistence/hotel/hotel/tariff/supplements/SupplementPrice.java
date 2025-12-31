package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.supplements;

import java.time.LocalDate;

public record SupplementPrice(
        LocalDate from,
        LocalDate to,
        String supplementCode,
        double increment,
        double percent,
        String comment
) {
}
