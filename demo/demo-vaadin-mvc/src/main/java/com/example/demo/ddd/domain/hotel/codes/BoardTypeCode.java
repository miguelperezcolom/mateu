package com.example.demo.ddd.domain.hotel.codes;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;

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
