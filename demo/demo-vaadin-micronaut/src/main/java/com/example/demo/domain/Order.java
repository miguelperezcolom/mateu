package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Serdeable
@Builder
public record Order(
    String id,
    OrderStatus status,
    Customer customer,
    LocalDate date,
    Amount totalAmount,
    LocalDateTime lastUpdated,
    String comments,
    List<OrderLine> lines) {

}
