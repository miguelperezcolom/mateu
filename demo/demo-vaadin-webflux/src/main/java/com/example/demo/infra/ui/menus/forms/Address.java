package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;

public class Address {

    String street = "Juan Crespí";
    String city;
    String state;
    String country;
    String zip;

    @Action
    void setDefaultValues() {
        street = "Arxiduc Lluís Salvador";
        country = "Spain";
        city = "Palma de Mallorca";
        state = "Baleares";
        zip = "07004";
    }
}
