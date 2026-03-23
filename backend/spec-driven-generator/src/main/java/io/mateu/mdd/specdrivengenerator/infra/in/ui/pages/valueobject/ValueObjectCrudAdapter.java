package io.mateu.mdd.specdrivengenerator.infra.in.ui.pages.valueobject;

import io.mateu.mdd.specdrivengenerator.application.query.ValueObjectQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ValueObjectRow;
import io.mateu.mdd.specdrivengenerator.application.usecases.valueobject.delete.DeleteValueObjectCommand;
import io.mateu.mdd.specdrivengenerator.application.usecases.valueobject.delete.DeleteValueObjectUseCase;
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
public class ValueObjectCrudAdapter implements CrudAdapter<
        ValueObjectViewModel,
        ValueObjectViewModel,
        ValueObjectViewModel,
        NoFilters,
        ValueObjectRow,
        String
        > {

    final ValueObjectViewModel viewModel;
    final DeleteValueObjectUseCase deleteUseCase;
    final ValueObjectQueryService queryService;

    @Override
    public ListingData<ValueObjectRow> search(String searchText,
                                       NoFilters filters,
                                       Pageable pageable) {
        return queryService.findAll(searchText, filters, pageable);
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        deleteUseCase.handle(new DeleteValueObjectCommand(selectedIds));
    }

    @Override
    public ValueObjectViewModel getView(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public ValueObjectViewModel getEditor(String id) {
        return viewModel.load(queryService
                .getById(id)
                .orElseThrow());
    }

    @Override
    public ValueObjectViewModel getCreationForm(HttpRequest httpRequest) {
        return viewModel;
    }
}
