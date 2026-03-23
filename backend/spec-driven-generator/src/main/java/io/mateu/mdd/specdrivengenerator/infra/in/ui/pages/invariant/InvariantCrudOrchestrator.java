package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.invariant;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantRow;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.interfaces.CrudAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Scope("prototype")
@Title("Invariants")
public class InvariantCrudOrchestrator extends CrudOrchestrator<
        InvariantViewModel,
        InvariantViewModel,
        InvariantViewModel,
        NoFilters,
        InvariantRow,
        String
        > {

    final InvariantCrudAdapter adapter;

    @Override
    public CrudAdapter<InvariantViewModel,
            InvariantViewModel, InvariantViewModel,
            NoFilters, InvariantRow, String> adapter() {
        return adapter;
    }

    @Override
    public String toId(String s) {
        return s;
    }
}
