package com.example.demo.ddd.pages;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;

record ProjectRow(String id, String name) {

}

@Route("/projects")
public class Projects implements ListingBackend<NoFilters, ProjectRow> {

    @Override
    public ListingData<ProjectRow> search(String searchText, NoFilters noFilters, Pageable pageable, HttpRequest httpRequest) {
        return null;
    }
}
