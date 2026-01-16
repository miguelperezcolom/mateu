package com.example.demo.ddd.infra.out.persistence.hotel.financial;

import jakarta.validation.constraints.NotEmpty;

public record InvoiceLine(
        String description,
        double value
) {
}
