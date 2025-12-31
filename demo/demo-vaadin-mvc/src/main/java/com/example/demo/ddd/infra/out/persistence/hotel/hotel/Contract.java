package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;

import java.util.List;

public record Contract(
        String id,
        String name,
        String hotelId,
        String agencyId,
        String seasonId,
        List<String> tariffIds
) implements GenericEntity {
}
