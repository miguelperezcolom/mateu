package com.example.demo.ddd.infra.out.persistence.hotel.hotel.inventory;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelLabelSupplier;
import io.mateu.core.infra.declarative.Entity;
import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;

import java.time.LocalDate;

public record InventoryLine(
        @GeneratedValue(UUIDValueGenerator.class)
        String id,
        @ForeignKey(search = HotelIdOptionsSupplier.class, label = HotelLabelSupplier.class)
        String inventoryId,
        @ForeignKey(search = RoomTypeCodeOptionsSupplier.class, label = RoomTypeCodeLabelSupplier.class)
        String roomTypeCode,
        LocalDate from,
        LocalDate to,
        int quantity) implements Entity<String> {
}
