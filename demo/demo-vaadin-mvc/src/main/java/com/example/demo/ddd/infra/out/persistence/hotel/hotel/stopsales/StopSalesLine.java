package com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.HotelLabelSupplier;
import io.mateu.core.infra.declarative.Entity;
import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.ReadOnly;

import java.time.LocalDate;

public record StopSalesLine(
        @GeneratedValue(UUIDValueGenerator.class)
        String id,
        @ForeignKey(search = HotelIdOptionsSupplier.class, label = HotelLabelSupplier.class)
        String hotelId,
        @ForeignKey(search = RoomTypeCodeOptionsSupplier.class, label = RoomTypeCodeLabelSupplier.class)
        String roomTypeCode,
        String name,
        LocalDate from,
        LocalDate to
) implements GenericEntity {
}
