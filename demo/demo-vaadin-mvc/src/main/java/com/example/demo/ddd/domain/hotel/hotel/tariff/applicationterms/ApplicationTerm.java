package com.example.demo.ddd.domain.hotel.hotel.tariff.applicationterms;

import java.time.LocalDate;

public record ApplicationTerm(
        LocalDate from,
        LocalDate to,
        TermType type,
        int value
) {
}
