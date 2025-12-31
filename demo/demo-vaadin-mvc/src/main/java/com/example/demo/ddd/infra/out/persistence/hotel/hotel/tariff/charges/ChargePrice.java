package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.charges;

import java.time.LocalDate;

public record ChargePrice(
        LocalDate from,
        LocalDate to,
        String chargeCode,
        String chargeName,
        String roomTypeCode,
        boolean optional,
        double increment,
        double percent,
        String comment
) {
}
