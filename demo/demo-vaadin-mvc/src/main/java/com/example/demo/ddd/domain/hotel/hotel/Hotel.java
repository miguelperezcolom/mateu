package com.example.demo.ddd.domain.hotel.hotel;

import com.example.demo.ddd.domain.hotel.hotel.stopsales.StopSalesLine;
import com.example.demo.ddd.domain.hotel.codes.BoardType;
import com.example.demo.ddd.domain.hotel.world.DestinationIdOptionsSupplier;
import com.example.demo.ddd.domain.hotel.world.DestinationLabelSupplier;
import com.example.demo.ddd.infra.in.ui.pages.shared.Deleteable;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

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
