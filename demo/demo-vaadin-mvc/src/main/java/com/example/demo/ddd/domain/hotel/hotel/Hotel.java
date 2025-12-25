package com.example.demo.ddd.domain.hotel.hotel;

import com.example.demo.ddd.domain.hotel.hotel.stopsales.StopSalesLine;
import com.example.demo.ddd.domain.hotel.codes.BoardType;
import com.example.demo.ddd.infra.in.ui.pages.hotel.GenericEntity;

import java.util.List;

public record Hotel(
        String id,
        String name,
        String image,
        String destinationId,
        List<RoomType> roomTypes,
        List<BoardType> boardTypes,
        List<Contract> contracts,
        List<Tariff> tariffs,
        List<Inventory> inventories,
        List<StopSalesLine> stopSales
        ) implements GenericEntity {
}
