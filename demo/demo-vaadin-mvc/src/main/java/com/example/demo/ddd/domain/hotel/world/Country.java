package com.example.demo.ddd.domain.hotel.world;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;

import java.util.List;

public record Country(
        String code,
        String name
) implements GenericEntity {
    @Override
    public String id() {
        return code;
    }
}
