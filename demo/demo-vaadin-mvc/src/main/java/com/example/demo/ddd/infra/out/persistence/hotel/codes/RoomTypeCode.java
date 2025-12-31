package com.example.demo.ddd.infra.out.persistence.hotel.codes;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;

public record RoomTypeCode(
        String code,
        String name
) implements GenericEntity {
    @Override
    public String id() {
        return code;
    }
}
