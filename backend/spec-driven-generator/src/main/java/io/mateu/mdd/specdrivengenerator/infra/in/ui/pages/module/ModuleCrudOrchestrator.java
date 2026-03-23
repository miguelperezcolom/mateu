package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.module;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ModuleRow;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.interfaces.CrudAdapter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Scope("prototype")
@Title("Modules")
public class ModuleCrudOrchestrator extends CrudOrchestrator<
        ModuleViewModel,
        ModuleViewModel,
        ModuleViewModel,
        NoFilters,
        ModuleRow,
        String
        > {

    final ModuleCrudAdapter adapter;

    @Override
    public CrudAdapter<ModuleViewModel,
            ModuleViewModel, ModuleViewModel,
            NoFilters, ModuleRow, String> adapter() {
        return adapter;
    }

    @Override
    public String toId(String s) {
        return s;
    }
}
