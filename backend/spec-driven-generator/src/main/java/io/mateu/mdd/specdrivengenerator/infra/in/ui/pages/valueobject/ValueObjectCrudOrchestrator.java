package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.valueobject;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ValueObjectRow;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.interfaces.CrudAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Scope("prototype")
@Title("Value Objects")
public class ValueObjectCrudOrchestrator extends CrudOrchestrator<
        ValueObjectViewModel,
        ValueObjectViewModel,
        ValueObjectViewModel,
        NoFilters,
        ValueObjectRow,
        String
        > {

    final ValueObjectCrudAdapter adapter;

    @Override
    public CrudAdapter<ValueObjectViewModel,
            ValueObjectViewModel, ValueObjectViewModel,
            NoFilters, ValueObjectRow, String> adapter() {
        return adapter;
    }

    @Override
    public String toId(String s) {
        return s;
    }
}
