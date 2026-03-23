package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.project;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectRow;
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
public class ProjectCrudOrchestrator extends CrudOrchestrator<
        ProjectViewModel,
        ProjectViewModel,
        ProjectViewModel,
        NoFilters,
        ProjectRow,
        String
        > {

    final ProjectCrudAdapter adapter;

    @Override
    public CrudAdapter<ProjectViewModel,
            ProjectViewModel, ProjectViewModel,
            NoFilters, ProjectRow, String> adapter() {
        return adapter;
    }

    @Override
    public String toId(String s) {
        return s;
    }
}
