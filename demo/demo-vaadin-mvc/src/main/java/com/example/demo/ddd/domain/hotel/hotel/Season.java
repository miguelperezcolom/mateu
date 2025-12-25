package com.example.demo.ddd.domain.hotel.hotel;

import java.time.LocalDate;

public record Season(String id, String name, LocalDate from, LocalDate to) {
}
