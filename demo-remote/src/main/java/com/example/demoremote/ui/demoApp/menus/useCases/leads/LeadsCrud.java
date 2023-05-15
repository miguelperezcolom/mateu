package com.example.demoremote.ui.demoApp.menus.useCases.leads;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@Scope("prototype")
public class LeadsCrud implements Crud<LeadsSearchForm, LeadsRow> {

    @Autowired@JsonIgnore
    LeadsDetail detail;

    @Autowired@JsonIgnore
    LeadsRepo repo;

    public LeadsCrud() {
    }

    @Override
    public Flux<LeadsRow> fetchRows(LeadsSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) throws Throwable {
        return repo.findAll();
    }

    @Override
    public Mono<Long> fetchCount(LeadsSearchForm filters) throws Throwable {
        return repo.findAll().count();
    }

    @Override
    public Object getDetail(LeadsRow intermediariesRow) throws Throwable {
        detail.load(intermediariesRow.getId());
        return detail;
    }

}
