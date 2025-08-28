package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Builder
@Serdeable
public record Address(String address, String postalCode, String city, String state, String country) {
}
