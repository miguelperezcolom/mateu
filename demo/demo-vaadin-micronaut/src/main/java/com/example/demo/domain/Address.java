package com.example.demo.domain;

import lombok.Builder;

@Builder
public record Address(String address, String postalCode, String city, String state, String country) {
}
