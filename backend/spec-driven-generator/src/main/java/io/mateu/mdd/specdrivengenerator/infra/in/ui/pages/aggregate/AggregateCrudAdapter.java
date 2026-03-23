package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.aggregate;

import io.mateu.mdd.specdrivengenerator.application.query.AggregateQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.AggregateRow;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.delete.DeleteAggregateCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.delete.DeleteAggregateUseCase;
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
public class AggregateCrudAdapter implements CrudAdapter<
        AggregateViewModel,
        AggregateViewModel,
        AggregateViewModel,
        NoFilters,
        AggregateRow,
        String
        > {

    final AggregateViewModel viewModel;
    final DeleteAggregateUseCase deleteUseCase;
    final AggregateQueryService queryService;

    @Override
    public ListingData<AggregateRow> search(String searchText,
                                       NoFilters filters,
                                       Pageable pageable) {
        return queryService.findAll(searchText, filters, pageable);
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        deleteUseCase.handle(new DeleteAggregateCommand(selectedIds));
    }

    @Override
    public AggregateViewModel getView(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public AggregateViewModel getEditor(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public AggregateViewModel getCreationForm(HttpRequest httpRequest) {
        return viewModel;
    }
}
