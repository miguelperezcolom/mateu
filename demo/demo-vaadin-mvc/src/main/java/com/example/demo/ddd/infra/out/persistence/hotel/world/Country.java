package com.example.demo.ddd.infra.out.persistence.hotel.world;

import io.mateu.core.infra.declarative.GenericEntity;

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
