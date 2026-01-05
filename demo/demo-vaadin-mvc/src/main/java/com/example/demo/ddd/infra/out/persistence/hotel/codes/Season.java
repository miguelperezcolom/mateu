package com.example.demo.ddd.infra.out.persistence.hotel.codes;

import io.mateu.core.infra.declarative.GenericEntity;

import java.time.LocalDate;

public record Season(String id, String name, LocalDate from, LocalDate to) implements GenericEntity {
}
