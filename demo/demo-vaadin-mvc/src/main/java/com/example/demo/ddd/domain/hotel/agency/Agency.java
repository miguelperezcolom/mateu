package com.example.demo.ddd.domain.hotel.agency;

import com.example.demo.ddd.infra.in.ui.pages.hotel.GenericEntity;
import com.example.demo.ddd.infra.out.persistence.Entity;

public record Agency(String id, String name) implements GenericEntity {
}
