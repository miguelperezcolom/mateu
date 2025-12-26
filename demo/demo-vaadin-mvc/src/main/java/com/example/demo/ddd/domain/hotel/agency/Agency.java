package com.example.demo.ddd.domain.hotel.agency;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;

public record Agency(String id, String name) implements GenericEntity {
}
