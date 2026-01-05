package com.example.demo.ddd.infra.out.persistence.hotel.codes;

import io.mateu.core.infra.declarative.GenericEntity;

public record BoardTypeCode(
        String code,
        String name,
        BoardType boardType
) implements GenericEntity {
    @Override
    public String id() {
        return code;
    }
}
