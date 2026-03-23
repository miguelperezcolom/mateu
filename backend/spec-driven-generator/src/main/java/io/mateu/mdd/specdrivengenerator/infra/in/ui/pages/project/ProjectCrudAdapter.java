package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.project;

import io.mateu.mdd.specdrivengenerator.application.query.ProjectQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectRow;
import io.mateu.mdd.specdrivengenerator.application.usecases.project.delete.DeleteProjectCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.project.delete.DeleteProjectUseCase;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Scope("prototype")
@RequiredArgsConstructor
public class ProjectCrudAdapter implements CrudAdapter<
        ProjectViewModel,
        ProjectViewModel,
        ProjectViewModel,
        NoFilters,
        ProjectRow,
        String
        > {

    final ProjectViewModel viewModel;
    final DeleteProjectUseCase deleteUseCase;
    final ProjectQueryService queryService;

    @Override
    public ListingData<ProjectRow> search(String searchText,
                                       NoFilters filters,
                                       Pageable pageable) {
        return queryService.findAll(searchText, filters, pageable);
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        deleteUseCase.handle(new DeleteProjectCommand(selectedIds));
    }

    @Override
    public ProjectViewModel getView(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public ProjectViewModel getEditor(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public ProjectViewModel getCreationForm(HttpRequest httpRequest) {
        return viewModel;
    }
}
