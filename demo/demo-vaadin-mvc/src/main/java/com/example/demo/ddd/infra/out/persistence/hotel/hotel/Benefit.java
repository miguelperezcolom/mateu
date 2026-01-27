package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

public record Benefit(
        BenefitType type,
        String description,
        double value
) {
}
