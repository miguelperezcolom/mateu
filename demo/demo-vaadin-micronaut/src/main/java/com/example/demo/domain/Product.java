package com.example.demo.domain;

import lombok.Builder;

import java.util.List;

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
