package com.example.demo.ddd.infra.in.ui;

import com.example.demo.ddd.infra.in.ui.pages.hotel.Agencies;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Bookings;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Countries;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Hotels;
import com.example.demo.ddd.infra.in.ui.pages.project.Projects;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import org.springframework.stereotype.Service;

@MateuUI("")
@Style("width: 100%;")
@Title("App")
@FavIcon("/images/favicon.png")
@PageTitle("My app")
@Logo("/images/logo.png")
public class Home {

    //@Menu
    //Projects projects;

    @Menu
    Agencies agencies;

    @Menu
    ProductSubmenu product;

    @Menu
    CallCenterSubmenu callCenter;

    @Menu
    FinancialSubmenu financial;

    String content = "Hola!";

}
