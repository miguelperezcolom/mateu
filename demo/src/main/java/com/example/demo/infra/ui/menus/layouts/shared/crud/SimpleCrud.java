package com.example.demo.infra.ui.menus.layouts.shared.crud;

import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.MateuUI;
import io.mateu.dtos.SortCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@MateuUI("/crud")
@Component@Scope("prototype")
public class SimpleCrud implements Crud<SearchForm, Row> {


    private final SimpleCrudService service;

    public SimpleCrud(SimpleCrudService service) {
        this.service = service;
    }

    @Override
    public Flux<Row> fetchRows(String searchText, SearchForm filters, List<SortCriteria> sortOrders,
                               int offset, int limit) {
        return service.fetchRows(filters, sortOrders, offset, limit);
    }

    @Override
    public Mono<Long> fetchCount(String searchText, SearchForm filters) {
        return service.fetchCount(filters);
    }

}
