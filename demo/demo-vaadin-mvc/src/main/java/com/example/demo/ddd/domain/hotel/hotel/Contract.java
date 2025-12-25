package com.example.demo.ddd.domain.hotel.hotel;

import java.util.List;

public record Contract(
        String hotelId,
        String agencyId,
        String seasonId,
        List<String> tariffIds
) {
}
