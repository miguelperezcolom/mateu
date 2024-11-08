package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.interfaces.Crud;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class MyReadOnlyPojoWithCrudCrud implements Crud<MyReadOnlyPojoWithCrudCrudSearchForm, MyReadOnlyPojoWithCrudCrudRow> {
    @Override
    public Mono<Page<MyReadOnlyPojoWithCrudCrudRow>> fetchRows(
            String searchText, MyReadOnlyPojoWithCrudCrudSearchForm filters, Pageable pageable) {
        return Flux.just(
                new MyReadOnlyPojoWithCrudCrudRow("Mateu", 16, "Bla bla bla Bla bla bla Bla bla bla Bla bla blaBla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla"),
                new MyReadOnlyPojoWithCrudCrudRow("Antonia", 47, "Bla bla bla Bla bla bla Bla bla bla Bla bla blaBla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla Bla bla bla")
        ).collectList()
                .map(items ->new PageImpl<>(items, pageable, items.size()));
    }

    @Override
    public boolean isSearchable() {
        return false;
    }
}
