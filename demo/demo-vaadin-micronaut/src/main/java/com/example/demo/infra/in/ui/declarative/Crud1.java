package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudlBackend;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

record Crud1Filters() {

}

record Crud1Row(
        String name,
        int age
) {

}



@Route("/app/crud1")
public class Crud1 implements CrudlBackend<Crud1Filters, Crud1Row> {


    @Override
    public CrudlData<Crud1Row> search(String searchText, Crud1Filters crud1Filters, Pageable pageable, HttpRequest httpRequest) {
        return new CrudlData<>(new Page<>(searchText, 0, 0, 0, List.of()));
    }

}
