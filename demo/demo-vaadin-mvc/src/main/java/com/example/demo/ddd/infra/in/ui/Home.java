package com.example.demo.ddd.infra.in.ui;

import com.example.demo.ddd.infra.in.ui.pages.hotel.Agencies;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Countries;
import com.example.demo.ddd.infra.in.ui.pages.hotel.Hotels;
import com.example.demo.ddd.infra.in.ui.pages.project.Projects;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;

@MateuUI("")
public class Home {

    @Menu
    Projects projects;

    @Menu
    Agencies agencies;

    @Menu
    Countries countries;

    @Menu
    Hotels hotels;

    String content = "Hola!";

}
