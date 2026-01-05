package com.example.demo.ddd.infra.in.ui;

import com.example.demo.ddd.infra.in.ui.pages.hotel.Bookings;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Files;
import io.mateu.uidl.annotations.Menu;

public class CallCenterSubmenu {

    @Menu
    Files files;

    @Menu
    Bookings bookings;

}
