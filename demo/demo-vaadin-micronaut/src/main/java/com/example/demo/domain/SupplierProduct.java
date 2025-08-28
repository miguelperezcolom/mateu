package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Serdeable
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
