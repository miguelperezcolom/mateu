package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import io.mateu.uidl.annotations.FormLayout;

public record Address(
        String address,
        String city,
        String postalCode,
        String state,
        String country
) {
}
