package com.example.demo.ddd.domain.hotel.codes;

import com.example.demo.ddd.infra.in.ui.pages.hotel.GenericEntity;
import com.example.demo.ddd.infra.out.persistence.Entity;

import java.time.LocalDate;

public record Season(String id, String name, LocalDate from, LocalDate to) implements GenericEntity {
}
