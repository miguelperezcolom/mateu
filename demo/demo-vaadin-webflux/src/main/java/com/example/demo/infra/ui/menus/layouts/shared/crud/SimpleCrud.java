package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Crud;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MateuUI;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@MateuUI("/crud")
@Component@Scope("prototype")
public class SimpleCrud implements Crud<SearchForm, Row> {


    private final SimpleCrudService service;

    public SimpleCrud(SimpleCrudService service) {
        this.service = service;
    }

    @Override
    public Mono<Page<Row>> fetchRows(
            String searchText, SearchForm filters, Pageable pageable) {
        return service.fetchRows(searchText, filters, pageable);
    }

}
