package com.example.demo.e2e;

import com.example.demo.e2e.entities.*;
import com.example.demo.e2e.forms.*;
import io.mateu.mdd.shared.annotations.MenuOption;

public class E2eJpaMenu {

    @MenuOption
    private Class teams = TeamEntity.class;

    @MenuOption
    private Class classrooms = ClassroomEntity.class;

    @MenuOption
    private Class persons = PersonEntity.class;

    @MenuOption
    private Class driverLicenses = DriverLicenseEntity.class;

    @MenuOption
    private Class cities = CityEntity.class;

    @MenuOption
    private Class countries = CountryEntity.class;

    @MenuOption
    private Class invoices = InvoiceEntity.class;

}
