package com.example.demo.ddd.domain.hotel.hotel;

import com.example.demo.ddd.domain.hotel.hotel.stopsales.StopSalesLine;
import com.example.demo.ddd.domain.hotel.codes.BoardType;
import com.example.demo.ddd.domain.hotel.world.DestinationIdOptionsSupplier;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.ForeignKey;

import java.util.List;

public record Hotel(
        String id,
        String name,
        String image,
        @ForeignKey(DestinationIdOptionsSupplier.class)
        String destinationId,
        List<String> roomTypeCodes,
        List<String> boardTypeCodes,
        List<String> contractIds,
        List<String> tariffIds,
        @Composition(targetClass = Inventory.class, foreignKeyField = "hotelId")
        List<String> inventoryIds,
        @Composition(targetClass = StopSalesLine.class, foreignKeyField = "hotelId")
        List<String> stopSalesIds
        ) implements GenericEntity {
}
