package com.example.demo.domain;

import lombok.Builder;

@Builder
public record SupplierProduct(
        int currentInventory,
        Amount msrp,
        String supplierNumber,
        int averageLeadTime,
        ProductStatus status,
        String country,
        int minimumOrderQuantity
) {
}
