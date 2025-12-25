package com.example.demo.ddd.domain.hotel.hotel.stopsales;

import java.time.LocalDate;

public record StopSalesLine(
        String hotelId,
        String roomTypeCode,
        LocalDate from,
        LocalDate to
) {
}
