package com.example.demo.ddd.domain.hotel.agency;

import com.example.demo.ddd.infra.out.persistence.Entity;

public record Agency(String id, String name) implements Entity<String> {
}
