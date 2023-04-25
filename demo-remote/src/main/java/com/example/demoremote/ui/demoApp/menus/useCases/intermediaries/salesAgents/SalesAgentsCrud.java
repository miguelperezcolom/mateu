package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.salesAgents;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service@Scope("prototype")@Setter@Getter
public class SalesAgentsCrud implements Crud<SalesAgentsSearchForm, SalesAgentsRow> {

    @Autowired@JsonIgnore
    SaleAgentDetail detail;

    @Autowired@JsonIgnore
    SaleAgentForm form;

    @Autowired@JsonIgnore
    SalesAgentsRepo repo;

    String intermediaryId;

    public SalesAgentsCrud() {
    }

    @Override
    public List<SalesAgentsRow> fetchRows(SalesAgentsSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) throws Throwable {
        return getFilteredList();
    }

    private List<SalesAgentsRow> getFilteredList() {
        return repo.findAll().stream().filter(r -> r.getIntermediaryId().equals(intermediaryId))
                .collect(Collectors.toList());
    }

    @Override
    public int fetchCount(SalesAgentsSearchForm filters) throws Throwable {
        return getFilteredList().size();
    }

    @Override
    public Object getDetail(SalesAgentsRow intermediariesRow) throws Throwable {
        detail.load(intermediariesRow.getId());
        return detail;
    }


    @Override
    public Object getNewRecordForm() throws Throwable {
        return form;
    }
}
