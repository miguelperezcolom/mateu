package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardTypeCodeLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardTypeCodeOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeLabelSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales.StopSalesLine;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales.StopSalesLineRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.HotelRoomType;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationIdOptionsSupplier;
import com.example.demo.ddd.infra.out.persistence.hotel.world.DestinationLabelSupplier;
import io.mateu.core.infra.declarative.Deleteable;
import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Image;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Tab;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public record Hotel(
        String id,
        String name,
        @ForeignKey(search = DestinationIdOptionsSupplier.class, label = DestinationLabelSupplier.class)
        String destinationId,
        @Tab("Address")
        @Colspan(2)
        @Label("")
        Address address,
        @Tab("Datasheet")
        @Colspan(2)
        @Label("")
        @Composition(targetClass = Datasheet.class, repositoryClass = DatasheetRepository.class, foreignKeyField = "")
        String datasheetId,
        @Tab("Rooms")
        @Colspan(2)
        @Label("")
        List<HotelRoomType> roomTypes,
        @ForeignKey(search = BoardTypeCodeOptionsSupplier.class, label = BoardTypeCodeLabelSupplier.class)
        @Tab("Boards")
        @Label("")
        @Colspan(2)
        List<String> boardTypeCodes,
        @Tab("Inventories")
        @Composition(targetClass = Inventory.class, repositoryClass = InventoryRepository.class, foreignKeyField = "hotelId")
        @Label("Inventories")
        @Colspan(2)
        List<String> inventoryIds,
        @Composition(targetClass = StopSalesLine.class, repositoryClass = StopSalesLineRepository.class, foreignKeyField = "hotelId")
        @Tab("Stop sales")
        @Label("Stop sales")
                @Colspan(2)
        List<String> stopSalesIds
        ) implements GenericEntity, Deleteable {

}
