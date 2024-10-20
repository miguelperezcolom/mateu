package com.example.demo.infra.ui.menus.forms;

import com.example.demo.infra.ui.menus.useCases.leads.LeadsRow;
import com.example.demo.infra.ui.menus.useCases.leads.LeadsSearchForm;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.dtos.SortCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

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
