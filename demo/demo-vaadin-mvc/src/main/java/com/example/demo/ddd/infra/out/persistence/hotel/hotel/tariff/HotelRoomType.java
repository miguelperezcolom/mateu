package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeOptionsSupplier;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.Label;

public record HotelRoomType(
        @ForeignKey(search = RoomTypeCodeOptionsSupplier.class, label = RoomTypeCodeLabelSupplier.class)
                @Label("Room type")
        String roomTypeCode,
        int baseCapacity,
        int maxCapacity
) {
}
