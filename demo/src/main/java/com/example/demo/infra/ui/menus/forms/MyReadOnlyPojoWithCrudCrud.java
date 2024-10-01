package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.dtos.SortCriteria;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class MyReadOnlyPojoWithCrudCrud implements Crud<MyReadOnlyPojoWithCrudCrudSearchForm, MyReadOnlyPojoWithCrudCrudRow> {
    @Override
    public Flux<MyReadOnlyPojoWithCrudCrudRow> fetchRows(String searchText, MyReadOnlyPojoWithCrudCrudSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) {
        return Flux.just(
                new MyReadOnlyPojoWithCrudCrudRow("Mateu", 16, "Bla bla bla Bla bla bla Bla bla bla Bla bla blaBla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla"),
                new MyReadOnlyPojoWithCrudCrudRow("Antonia", 47, "Bla bla bla Bla bla bla Bla bla bla Bla bla blaBla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla")
        );
    }

    @Override
    public Mono<Long> fetchCount(String searchText, MyReadOnlyPojoWithCrudCrudSearchForm filters) {
        return Mono.just(2L);
    }
}
