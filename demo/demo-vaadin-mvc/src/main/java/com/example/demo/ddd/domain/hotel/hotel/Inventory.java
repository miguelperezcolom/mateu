package com.example.demo.ddd.domain.hotel.hotel;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;

public record Inventory(String hotelId, String id, String name) implements GenericEntity {
}
