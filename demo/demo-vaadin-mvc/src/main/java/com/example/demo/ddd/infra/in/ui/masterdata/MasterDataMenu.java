package com.example.demo.ddd.infra.in.ui.masterdata;

import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Countries;
import com.example.demo.ddd.infra.in.ui.product.pages.hotel.Destinations;
import io.mateu.uidl.annotations.Menu;

public class MasterDataMenu {

    @Menu
    Countries countries;

    @Menu
    Destinations destinations;

}
