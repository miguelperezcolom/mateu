package ${project.packageName}.infra.in.ui.suppliers;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.ForeignKeyOptionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import ${project.packageName}.application.query.${aggregate.name}QueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ${aggregate.name}IdOptionsSupplier implements ForeignKeyOptionsSupplier {

final ${aggregate.name}QueryService queryService;

@Override
public ListingData<Option> search(String searchText, Pageable pageable, HttpRequest httpRequest) {
    var found = queryService.findAll(searchText, null, pageable);
    return new ListingData<>(new Page<>(
    searchText,
    found.page().pageSize(),
    found.page().pageNumber(),
    found.page().totalElements(),
    found.page().content().stream().map(${aggregate.name?lower_case} ->
    new Option(${aggregate.name?lower_case}.id(), ${aggregate.name?lower_case}.name())).toList()));
    }
    }
