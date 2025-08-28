package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Serdeable
@Builder
public record Contact(
        String name,
        String supplierNumber,
        String contact,
        String email,
        String phoneNumber,
        String url
) {
}
