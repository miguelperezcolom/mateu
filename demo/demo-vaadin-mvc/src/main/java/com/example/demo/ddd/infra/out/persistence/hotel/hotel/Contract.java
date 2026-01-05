package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import io.mateu.core.infra.declarative.GenericEntity;

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
