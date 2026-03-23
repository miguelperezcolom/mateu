package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.entity;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityRow;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.interfaces.CrudAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Scope("prototype")
@Title("Entitys")
public class EntityCrudOrchestrator extends CrudOrchestrator<
        EntityViewModel,
        EntityViewModel,
        EntityViewModel,
        NoFilters,
        EntityRow,
        String
        > {

    final EntityCrudAdapter adapter;

    @Override
    public CrudAdapter<EntityViewModel,
            EntityViewModel, EntityViewModel,
            NoFilters, EntityRow, String> adapter() {
        return adapter;
    }

    @Override
    public String toId(String s) {
        return s;
    }
}
