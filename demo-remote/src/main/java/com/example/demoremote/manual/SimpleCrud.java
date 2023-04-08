package com.example.demoremote.manual;

import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.annotations.MateuUI;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.List;

@MateuUI("/crud")
@Service @Scope("stereotype")
public class SimpleCrud implements Crud<SearchForm, Row> {

    @Autowired
    SimpleCrudService service;

    @Override
    public List<Row> fetchRows(SearchForm filters, List<SortCriteria> sortOrders,
                               int offset, int limit) throws Throwable {
        return service.fetchRows(filters, sortOrders, offset, limit);
    }

    @Override
    public int fetchCount(SearchForm filters) throws Throwable {
        return service.fetchCount(filters);
    }

}
