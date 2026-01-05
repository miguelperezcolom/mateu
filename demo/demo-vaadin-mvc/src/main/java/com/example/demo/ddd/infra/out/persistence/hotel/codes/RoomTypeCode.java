package com.example.demo.ddd.infra.out.persistence.hotel.codes;

import io.mateu.core.infra.declarative.GenericEntity;

public record RoomTypeCode(
        String code,
        String name
) implements GenericEntity {
    @Override
    public String id() {
        return code;
    }
}
