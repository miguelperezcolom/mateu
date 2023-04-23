package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Scope("prototype")
public class IntermediariesCrud implements Crud<IntermediariesSearchForm, IntermediariesRow> {

    @Autowired@JsonIgnore
    IntermediaryDetail detail;

    public IntermediariesCrud() {
    }

    @Override
    public List<IntermediariesRow> fetchRows(IntermediariesSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) throws Throwable {
        return List.of(
                new IntermediariesRow("1", "North Sails")
        );
    }

    @Override
    public int fetchCount(IntermediariesSearchForm filters) throws Throwable {
        return 1;
    }

    @Override
    public Object getDetail(IntermediariesRow intermediariesRow) throws Throwable {
        detail.load(intermediariesRow.getId());
        return detail;
    }
}
