package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.aggregate;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.AggregateRow;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.interfaces.CrudAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Scope("prototype")
@Title("Roles")
public class AggregateCrudOrchestrator extends CrudOrchestrator<
        AggregateViewModel,
        AggregateViewModel,
        AggregateViewModel,
        NoFilters,
        AggregateRow,
        String
        > {

    final AggregateCrudAdapter adapter;

    @Override
    public CrudAdapter<AggregateViewModel,
            AggregateViewModel, AggregateViewModel,
            NoFilters, AggregateRow, String> adapter() {
        return adapter;
    }

    @Override
    public String toId(String s) {
        return s;
    }
}
