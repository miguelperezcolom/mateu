package com.example.demo.ddd.domain.hotel.codes;

import com.example.demo.ddd.domain.hotel.world.Destination;
import com.example.demo.ddd.infra.in.ui.pages.hotel.GenericEntity;

import java.util.List;

public record RoomTypeCode(
        String code,
        String name
) implements GenericEntity {
    @Override
    public String id() {
        return code;
    }
}
