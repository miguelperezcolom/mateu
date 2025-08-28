package com.example.demo.domain;

import lombok.Builder;

@Builder
public record Customer(
    String id,
    String name,
    String phoneNumber,
    String email,
    Address billingAddress,
    Address shippingAddress) {
}
