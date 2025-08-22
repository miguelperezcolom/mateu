package com.example.demo.infra.in.ui.fluent.crudls;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CrudlBackend;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveCrudlBackend;
import io.micronaut.serde.annotation.Serdeable;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

record Filters(int age) {}
@Serdeable
record Row(String name, int age) {}

@Route("/fluent-app/crudls/basic")
@Slf4j
public class BasicCrudl implements ComponentTreeSupplier, CrudlBackend<Filters, Row> {

    @JsonIgnore
    List<Row> allItems = List.of(
            new Row("Mateu", 17),
            new Row("Antonia", 49),
            new Row("Antonia", 49),
            new Row("Antonia", 49),
            new Row("Antonia", 49),
            new Row("Antonia", 49),
            new Row("Antonia", 49),
            new Row("Antonia", 49),
            new Row("Antonia", 49),
            new Row("Antonia", 49),
            new Row("Antonia", 49),
            new Row("Antonia", 49),
            new Row("Antonia", 49),
            new Row("Antonia", 49)
    );

    @Override
    public Crudl component(HttpRequest httpRequest) {
        return Crudl.builder() // vertical layout as default container for children
                .title("Basic crudl")
                .id("crud")
                .filters(List.of(
                        FormField.builder()
                                .id("age")
                                .label("Age")
                                .dataType(FieldDataType.integer)
                                .build()
                ))
                .searchable(true)
                .columns(List.of(
                        GridColumn.builder()
                                .id("name")
                                .label("Name")
                                .sortable(true)
                                .build(),
                        GridColumn.builder()
                                .id("age")
                                .label("Age")
                                .sortable(true)
                                .build()
                ))
                .emptyStateMessage("Please search.")
                .build();
    }

    @Override
    public Class<Filters> filtersClass() {
        return Filters.class;
    }

    @Override
    public CrudlData<Row> search(String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
        var filteredItems = allItems.stream()
                .filter(item -> (searchText.isEmpty()
                        || item.name()
                        .toLowerCase()
                        .contains(searchText))
                        &&
                        (filters.age() == 0 || item.age() == filters.age()))
                .sorted((a, b) -> {
                    int compare = 0;
                    for (Sort sort : pageable.sort()) {
                        if ("age".equals(sort.field())) {
                            compare = Integer.compare(a.age(), b.age()) * (Direction.ascending.equals(sort.direction())?-1:1);
                        }
                        if ("name".equals(sort.field())) {
                            compare = a.name().compareTo(b.name()) * (Direction.ascending.equals(sort.direction())?-1:1);
                        }
                        if (compare != 0) {
                            break;
                        }
                    }
                    return compare;
                })
                .toList();
        return new CrudlData<>(new Page<>(
                pageable.size(),
                pageable.page(),
                filteredItems.size(),
                filteredItems.stream().skip((long) pageable.size() * pageable.page()).limit(pageable.size()).toList()
        ),
                "No items found. Please try again.");
    }
}
