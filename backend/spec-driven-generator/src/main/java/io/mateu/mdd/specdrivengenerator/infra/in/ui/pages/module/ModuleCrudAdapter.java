package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.module;

import io.mateu.mdd.specdrivengenerator.application.query.ModuleQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ModuleRow;
import io.mateu.mdd.specdrivengenerator.application.usecases.module.delete.DeleteModuleCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.module.delete.DeleteModuleUseCase;
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
public class ModuleCrudAdapter implements CrudAdapter<
        ModuleViewModel,
        ModuleViewModel,
        ModuleViewModel,
        NoFilters,
        ModuleRow,
        String
        > {

    final ModuleViewModel viewModel;
    final DeleteModuleUseCase deleteUseCase;
    final ModuleQueryService queryService;

    @Override
    public ListingData<ModuleRow> search(String searchText,
                                         NoFilters filters,
                                         Pageable pageable) {
        return queryService.findAll(searchText, filters, pageable);
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        deleteUseCase.handle(new DeleteModuleCommand(selectedIds));
    }

    @Override
    public ModuleViewModel getView(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public ModuleViewModel getEditor(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public ModuleViewModel getCreationForm(HttpRequest httpRequest) {
        return viewModel;
    }
}
