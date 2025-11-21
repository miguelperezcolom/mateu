package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.ListingBackend;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

record Crud1Filters() {

}

record Crud1Row(
        String name,
        int age
) {

}

@Route("/crud1")
public class Crud1 implements ListingBackend<Crud1Filters, Crud1Row> {


    @Override
    public ListingData<Crud1Row> search(String searchText, Crud1Filters crud1Filters, Pageable pageable, HttpRequest httpRequest) {
        return new ListingData<>(new Page<>(searchText, 0, 0, 0, List.of()));
    }

}
