package com.example.demo.ddd.domain.hotel.world;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;

import java.util.List;

public record Destination(
        String code,
        String name,
        String countryCode,
        List<String> hotelIds
) implements GenericEntity {
    @Override
    public String id() {
        return code;
    }
}
