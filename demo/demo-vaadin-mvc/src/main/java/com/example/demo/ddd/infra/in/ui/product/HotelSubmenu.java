package com.example.demo.ddd.infra.in.ui.product;

import com.example.demo.ddd.infra.in.ui.product.pages.hotel.*;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.stopsales.StopSalesLine;
import io.mateu.uidl.annotations.Menu;

public class HotelSubmenu {

    @Menu
    HotelMasterDataMenu masterData;

    @Menu
    Hotels hotels;

//    @Menu
//    StopSales stopSales;
//    @Menu
//    Inventories inventories;
//    @Menu
//    InventoryLines inventoryLines;
    @Menu
    Contracts contracts;
    @Menu
    Tariffs tariffs;
    @Menu
    Offers offers;

    @Menu
    StopSalesCalendar stopSalesCalendar;

    @Menu
    InventoryCalendar inventoryCalendar;

    @Menu
    ReleaseCalendar releaseCalendar;
}
