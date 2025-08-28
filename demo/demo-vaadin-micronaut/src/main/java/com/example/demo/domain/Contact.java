package com.example.demo.domain;

import lombok.Builder;

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
