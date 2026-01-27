package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.periods;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.HiddenInEditor;
import io.mateu.uidl.annotations.HiddenInList;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public record Price(
        @ColumnWidth("50px")
        int number,
        @ColumnWidth("50px")
        int periodNumber,
        @HiddenInList
        @Colspan(2)
        List<PricePerRoom> pricePerRoom,
        @HiddenInEditor
        @ColumnWidth("500px")
        String prices,
        @ColumnWidth("200px")
        String comments
) {

    public Price {
        prices = serialize(pricePerRoom);
    }

    private String serialize(List<PricePerRoom> pricePerRoom) {
        if (pricePerRoom == null) {
            return null;
        }
        return pricePerRoom.stream().map(price -> "" + price.roomCode() + ": " + price.price()).collect(Collectors.joining(", "));
    }
}
