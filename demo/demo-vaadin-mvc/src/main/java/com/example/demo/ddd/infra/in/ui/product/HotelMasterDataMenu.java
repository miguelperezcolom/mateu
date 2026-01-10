package com.example.demo.ddd.infra.in.ui.product;

import com.example.demo.ddd.infra.in.ui.product.pages.hotel.BoardTypeCodes;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.RoomTypeCodes;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Seasons;
import io.mateu.uidl.annotations.Menu;

public class HotelMasterDataMenu {

    @Menu
    Seasons seasons;

    @Menu
    RoomTypeCodes roomTypeCodes;

    @Menu
    BoardTypeCodes boardTypeCodes;
}
