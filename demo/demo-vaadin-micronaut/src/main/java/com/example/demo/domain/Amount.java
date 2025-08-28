package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record Amount(double value, String currencyCode) {
}
