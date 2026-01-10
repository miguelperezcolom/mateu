package com.example.demo.ddd.infra.in.ui.product;

import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Contracts;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Hotels;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Inventories;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Tariffs;
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
