package com.example.demo.ddd.infra.in.ui;

import com.example.demo.ddd.infra.in.ui.pages.hotel.BoardTypeCodes;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Contracts;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Countries;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Destinations;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Hotels;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Inventories;
import com.example.demo.ddd.infra.in.ui.pages.hotel.RoomTypeCodes;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Seasons;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Tariffs;
import io.mateu.uidl.annotations.Menu;

public class ProductSubmenu {

    @Menu
    MasterDataMenu masterData;

    @Menu
    HotelSubmenu hotel;

    @Menu
    TransferSubmenu transfer;

}
