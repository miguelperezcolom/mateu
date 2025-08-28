package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record OrderLine(Product product, int quantity) {
}
