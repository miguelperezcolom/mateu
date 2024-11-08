package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.uidl.interfaces.Crud;
import io.mateu.uidl.annotations.MateuUI;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@MateuUI("/crudslow")
@Component@Scope("prototype")
public class SimpleSlowCrud implements Crud<SearchForm, Row> {


    private final SimpleCrudService service;

    public SimpleSlowCrud(SimpleCrudService service) {
        this.service = service;
    }

    @Override
    public Mono<Page<Row>> fetchRows(
            String searchText, SearchForm filters, Pageable pageable) throws InterruptedException {
        Thread.sleep(10000);
        return service.fetchRows(searchText, filters, pageable);
    }

}
