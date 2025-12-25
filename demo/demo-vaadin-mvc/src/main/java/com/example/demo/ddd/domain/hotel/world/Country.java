package com.example.demo.ddd.domain.hotel.world;

import com.example.demo.ddd.infra.out.persistence.Entity;

import java.util.List;

public record Country(
        String code,
        String name,
        List<Destination> destinations
) implements Entity<String> {
    @Override
    public String id() {
        return code;
    }
}
