package com.example.demo.ddd.domain.hotel.world;

import com.example.demo.ddd.infra.in.ui.pages.hotel.GenericEntity;
import com.example.demo.ddd.infra.out.persistence.Entity;

import java.util.List;

public record Country(
        String code,
        String name,
        List<Destination> destinations
) implements GenericEntity {
    @Override
    public String id() {
        return code;
    }
}
