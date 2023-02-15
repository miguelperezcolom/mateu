package com.example.demo.e2e;

import com.example.demo.e2e.entities.*;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.interfaces.JpaCrud;

import java.util.List;

public class E2eJpaMenu {

    @MenuOption
    private JpaCrud<TeamEntity> teams = new JpaCrud<TeamEntity>() {

        @Override
        public List<String> getSearchFilterFields() {
            return List.of("name");
        }

        @Override
        public List<String> getColumnFields() {
            return List.of("id, name");
        }

        @Override
        public List<String> getVisibleFields() {
            return List.of("id,name");
        }
    };

    @MenuOption
    private JpaCrud<TeamEntity> winners = new JpaCrud<TeamEntity>() {

        @Override
        public List<String> getSearchFilterFields() {
            return List.of("name");
        }

        @Override
        public List<String> getColumnFields() {
            return List.of("id,name");
        }

        @Override
        public List<String> getVisibleFields() {
            return List.of("id,name,owner");
        }

        @Override
        public List<String> getReadOnlyFields() {
            return List.of("name");
        }

        @Override
        public String getExtraWhereFilter() {
            return "x.superBowls > 0";
        }

        @Override
        public boolean canAdd() {
            return false;
        }

        @Override
        public boolean canDelete() {
            return false;
        }

        @Override
        public boolean isReadOnly() {
            return true;
        }
    };


    @MenuOption
    private JpaCrud<ClassroomEntity> classrooms;

    @MenuOption
    private JpaCrud<PersonEntity> persons;

    @MenuOption
    private JpaCrud<DriverLicenseEntity> driverLicenses;

    @MenuOption
    private JpaCrud<CityEntity> cities;

    @MenuOption
    private JpaCrud<CountryEntity> countries;

    @MenuOption
    private JpaCrud<InvoiceEntity> invoices;

}
