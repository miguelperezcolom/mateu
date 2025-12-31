package com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales;

import java.time.LocalDate;

public record StopSalesLine(
        String hotelId,
        String roomTypeCode,
        LocalDate from,
        LocalDate to
) {
}
