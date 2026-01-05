package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

public record Address(
        String address,
        String city,
        String postalCode,
        String state,
        String country
) {
}
