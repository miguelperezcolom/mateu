package com.example.demo.ddd.infra.in.ui;

import com.example.demo.ddd.infra.in.ui.pages.hotel.BoardTypeCodes;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Countries;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Destinations;
import com.example.demo.ddd.infra.in.ui.pages.hotel.RoomTypeCodes;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Seasons;
import io.mateu.uidl.annotations.Menu;

public class HotelMasterDataMenu {

    @Menu
    Seasons seasons;

    @Menu
    RoomTypeCodes roomTypeCodes;

    @Menu
    BoardTypeCodes boardTypeCodes;
}
