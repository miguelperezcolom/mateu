package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;

import java.util.List;

record Crud1Filters() {

}

record Crud1Row(
        String name,
        int age
) {

}

@Route(value="/crud1", parentRoute="")
public class Crud1 implements Listing<Crud1Row>, Searchable, Filterable<Crud1Filters> {


    @Override
    public ListingData<Crud1Row> search(SearchRequest request, HttpRequest httpRequest) {
        var searchText = request.searchText();
        return new ListingData<>(new Page<>(searchText, 0, 0, 0, List.of()));
    }

}
