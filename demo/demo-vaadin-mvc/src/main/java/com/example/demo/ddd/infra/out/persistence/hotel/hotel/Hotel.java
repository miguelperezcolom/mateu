package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales.StopSalesLine;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationLabelSupplier;
import com.example.demo.ddd.infra.in.ui.pages.shared.Deleteable;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.ForeignKey;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public record Hotel(
        String id,
        String name,
        String image,
        @ForeignKey(search = DestinationIdOptionsSupplier.class, label = DestinationLabelSupplier.class)
        String destinationId,
        List<String> roomTypeCodes,
        List<String> boardTypeCodes,
        List<String> contractIds,
        List<String> tariffIds,
        @Composition(targetClass = Inventory.class, foreignKeyField = "hotelId")
        List<String> inventoryIds,
        @Composition(targetClass = StopSalesLine.class, foreignKeyField = "hotelId")
        List<String> stopSalesIds
        ) implements GenericEntity, Deleteable {

}
