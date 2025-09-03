package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;
import lombok.With;

@Serdeable
public record OrderLine(String lineId, Product product, int quantity) {
}
