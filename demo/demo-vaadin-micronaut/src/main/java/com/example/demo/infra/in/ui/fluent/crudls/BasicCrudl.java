package com.example.demo.infra.in.ui.fluent.crudls;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Column;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ReactiveHandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Route("/fluent-app/crudls/basic")
@Slf4j
public class BasicCrudl implements ComponentTreeSupplier, ReactiveHandlesActions {

    @JsonIgnore
    CrudlData crud = new CrudlData(new Page<Object>(10, 0, 0, List.of()));

    @JsonIgnore
    List<Map<String, Object>> allItems = List.of(
            Map.of("name", "Mateu", "age", 17),
            Map.of("name", "Antonia", "age", 49),
            Map.of("name", "Antonia", "age", 49),
            Map.of("name", "Antonia", "age", 49),
            Map.of("name", "Antonia", "age", 49),
            Map.of("name", "Antonia", "age", 49),
            Map.of("name", "Antonia", "age", 49),
            Map.of("name", "Antonia", "age", 49),
            Map.of("name", "Antonia", "age", 49),
            Map.of("name", "Antonia", "age", 49),
            Map.of("name", "Antonia", "age", 49)
    );

    @Override
    public Crudl getComponent(HttpRequest httpRequest) {
        return Crudl.builder() // vertical layout as default container for children
                .title("Basic crudl")
                .id("crud")
                .filters(List.of(
                        FormField.builder()
                                .id("age")
                                .label("Age")
                                .dataType(FieldDataType.integer)
                                .bindToData(true)
                                .build()
                ))
                .searchable(true)
                .columns(List.of(
                        Column.builder()
                                .id("name")
                                .label("Name")
                                .build(),
                        Column.builder()
                                .id("age")
                                .label("Age")
                                .build()
                ))
                .emptyStateMessage("Please search.")
                .build();
    }

    @Override
    public boolean supportsAction(String actionId) {
        return !"".equals(actionId);
    }

    @Override
    public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {
        log.info("received action: " + actionId);

        var searchText = httpRequest.getString("searchText");
        var age = httpRequest.getInt("age");

        var cruddata = new CrudlData(new Page<>(
                5,
                0,
                allItems.size(),
                allItems.stream()
                        .filter(item -> (searchText.isEmpty()
                                || ((String) item.getOrDefault("name", ""))
                                .toLowerCase()
                                .contains(searchText))
                                &&
                                (age == 0 || ((int)item.getOrDefault("age", -1)) == age))
                        .skip(0).limit(5).toList()
                ),
                "No items found. Please try again.");

        return Mono.just(new Data(Map.of("crud", cruddata)));
    }
}
