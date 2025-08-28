package com.example.demo.domain;

import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record Order(
    String id,
    Customer customer,
    LocalDate date,
    Amount totalAmount,
    LocalDateTime lastUpdated,
    String comments,
    List<OrderLine> lines) {

}
