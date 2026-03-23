package io.mateu.mdd.specdrivengenerator.infra.in.ui.suppliers;

import io.mateu.mdd.specdrivengenerator.application.query.ProjectQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.ValueObjectQueryService;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.ForeignKeyOptionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ValueObjectIdOptionsSupplier implements ForeignKeyOptionsSupplier {

    final ValueObjectQueryService queryService;

    @Override
    public ListingData<Option> search(String searchText, Pageable pageable, HttpRequest httpRequest) {
        var found = queryService.findAll(searchText, null, pageable);
        return new ListingData<>(new Page<>(
                searchText,
                found.page().pageSize(),
                found.page().pageNumber(),
                found.page().totalElements(),
                found.page().content().stream().map(workflowDefinition ->
                        new Option(workflowDefinition.id(), workflowDefinition.name())).toList()));
    }
}
