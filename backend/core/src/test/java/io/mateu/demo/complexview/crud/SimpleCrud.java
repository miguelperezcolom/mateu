package io.mateu.demo.complexview.crud;

import io.mateu.core.domain.model.outbound.Humanizer;
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

    @Autowired
    SimpleCrudService service;
    @Autowired
    private Humanizer humanizer;

    @Override
    public Flux<Row> fetchRows(SearchForm filters, List<SortCriteria> sortOrders,
                               int offset, int limit) throws Throwable {
        return service.fetchRows(filters, sortOrders, offset, limit);
    }

    @Override
    public Mono<Long> fetchCount(SearchForm filters) throws Throwable {
        return service.fetchCount(filters);
    }

    @Override
    public String toString() {
        return humanizer.capitalize(getClass().getSimpleName());
    }
}
