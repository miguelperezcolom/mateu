package com.example.demo.infra.in.ui;

import com.example.demo.infra.in.ui.pages.countries.Countries;
import com.example.demo.infra.in.ui.pages.persons.Persons;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.UI;

@UI("")
public class Home {

    @Menu
    Persons persons;

    @Menu
    Countries countries;

}
