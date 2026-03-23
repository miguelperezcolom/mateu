package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.entity;

import io.mateu.mdd.specdrivengenerator.application.query.EntityQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityRow;
import io.mateu.mdd.specdrivengenerator.application.usecases.entity.delete.DeleteEntityCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.entity.delete.DeleteEntityUseCase;
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
public class EntityCrudAdapter implements CrudAdapter<
        EntityViewModel,
        EntityViewModel,
        EntityViewModel,
        NoFilters,
        EntityRow,
        String
        > {

    final EntityViewModel viewModel;
    final DeleteEntityUseCase deleteUseCase;
    final EntityQueryService queryService;

    @Override
    public ListingData<EntityRow> search(String searchText,
                                       NoFilters filters,
                                       Pageable pageable) {
        return queryService.findAll(searchText, filters, pageable);
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        deleteUseCase.handle(new DeleteEntityCommand(selectedIds));
    }

    @Override
    public EntityViewModel getView(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public EntityViewModel getEditor(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public EntityViewModel getCreationForm(HttpRequest httpRequest) {
        return viewModel;
    }
}
