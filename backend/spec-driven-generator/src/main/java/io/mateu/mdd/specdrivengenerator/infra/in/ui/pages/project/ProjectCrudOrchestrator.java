package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.project;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectRow;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Scope("prototype")
@Title("Projects")
@Slf4j
public class ProjectCrudOrchestrator extends CrudOrchestrator<
        ProjectViewModel,
        ProjectViewModel,
        ProjectViewModel,
        NoFilters,
        ProjectRow,
        String
        > {

    final ProjectCrudAdapter adapter;
    final GenerateBoilerplateCodeForm form;

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

    @ViewToolbarButton
    public GenerateBoilerplateCodeForm generateCode(ProjectViewModel project, HttpRequest httpRequest) {
        log.info("hola!");
        form.projectId = project.id;
        form.outputPath = project.outputPath;
        form.packageName = project.packageName;
        return form;
    }
}
