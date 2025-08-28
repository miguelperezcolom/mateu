package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.util.List;

@Serdeable
@Builder
public record Product(
        String id,
        String name,
        String manufacturer,
        String description,
        String brand,
        String category,
        Amount listPrice,
        int weight,
        String dimensions,
        Contact supplierContact,
        SupplierProduct supplierProduct,
        String image,
        List<Order> orders
        ) {
}
