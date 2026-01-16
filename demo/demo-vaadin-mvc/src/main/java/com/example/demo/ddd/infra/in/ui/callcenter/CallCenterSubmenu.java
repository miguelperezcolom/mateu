package com.example.demo.ddd.infra.in.ui.callcenter;

import com.example.demo.ddd.infra.in.ui.callcenter.pages.Bookings;
import com.example.demo.ddd.infra.in.ui.callcenter.pages.Files;
import io.mateu.uidl.annotations.Menu;

public class CallCenterSubmenu {

    @Menu
    Files files;

    @Menu
    Bookings bookings;

}
