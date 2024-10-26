package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Crud;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MateuUI;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@MateuUI("/cardscrud")
@Component@Scope("prototype")
public class SimpleCardsCrud implements Crud<SearchForm, Row> {


    private final SimpleCrudService service;

    public SimpleCardsCrud(SimpleCrudService service) {
        this.service = service;
    }

    @Override
    public boolean isShowCards() {
        return true;
    }

    @Override
    public Mono<Page<Row>> fetchRows(
            String searchText, SearchForm filters, Pageable pageable) {
        return service.fetchRows(searchText, filters, pageable);
    }

}
