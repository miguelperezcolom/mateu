package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Serdeable
@Builder
public record Customer(
    String id,
    String name,
    String phoneNumber,
    String email,
    Address billingAddress,
    Address shippingAddress) {
}
