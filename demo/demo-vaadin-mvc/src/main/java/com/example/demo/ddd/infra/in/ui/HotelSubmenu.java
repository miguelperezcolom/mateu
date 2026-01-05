package com.example.demo.ddd.infra.in.ui;

import com.example.demo.ddd.infra.in.ui.pages.hotel.BoardTypeCodes;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Contracts;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Hotels;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Inventories;
import com.example.demo.ddd.infra.in.ui.pages.hotel.RoomTypeCodes;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Seasons;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Tariffs;
import io.mateu.uidl.annotations.Menu;

public class HotelSubmenu {

    @Menu
    HotelMasterDataMenu masterData;

    @Menu
    Hotels hotels;

    @Menu
    Inventories inventories;
    @Menu
    Contracts contracts;
    @Menu
    Tariffs tariffs;

}
