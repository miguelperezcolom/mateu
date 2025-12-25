package com.example.demo.ddd.domain.hotel.hotel.inventory;

import java.time.LocalDate;

public record InventoryLine(
        String inventoryId,
        String roomTypeCode,
        LocalDate from,
        LocalDate to,
        int quantity) {
}
