package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.invariant;

import io.mateu.mdd.specdrivengenerator.application.query.InvariantQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantRow;
import io.mateu.mdd.specdrivengenerator.application.usecases.invariant.delete.DeleteInvariantCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.invariant.delete.DeleteInvariantUseCase;
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
public class InvariantCrudAdapter implements CrudAdapter<
        InvariantViewModel,
        InvariantViewModel,
        InvariantViewModel,
        NoFilters,
        InvariantRow,
        String
        > {

    final InvariantViewModel viewModel;
    final DeleteInvariantUseCase deleteUseCase;
    final InvariantQueryService queryService;

    @Override
    public ListingData<InvariantRow> search(String searchText,
                                       NoFilters filters,
                                       Pageable pageable) {
        return queryService.findAll(searchText, filters, pageable);
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        deleteUseCase.handle(new DeleteInvariantCommand(selectedIds));
    }

    @Override
    public InvariantViewModel getView(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public InvariantViewModel getEditor(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public InvariantViewModel getCreationForm(HttpRequest httpRequest) {
        return viewModel;
    }
}
