package com.example.demo.ddd.domain.hotel.world;

import com.example.demo.ddd.domain.hotel.hotel.Hotel;
import com.example.demo.ddd.infra.out.persistence.Entity;

import java.util.List;

public record Destination(
        String code,
        String name,
        List<String> hotelIds
) implements Entity<String> {
    @Override
    public String id() {
        return code;
    }
}
