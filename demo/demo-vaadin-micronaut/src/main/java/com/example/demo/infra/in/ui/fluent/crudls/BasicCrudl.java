package com.example.demo.infra.in.ui.fluent.crudls;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Column;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ReactiveHandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

record CrudData(Page<?> page) {}

@Route("/fluent-app/crudls/basic")
public class BasicCrudl implements ComponentTreeSupplier, ReactiveHandlesActions {

    CrudData crud = new CrudData(new Page<Object>(0, 0, List.of()));

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
                .build();
    }

    @Override
    public boolean supportsAction(String actionId) {
        return !"".equals(actionId);
    }

    @Override
    public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {
        System.out.println("received action: " + actionId);

        this.crud = new CrudData(new Page<Object>(1, 2, List.of(
                Map.of("name", "Mateu", "age", 17),
                Map.of("name", "Antonia", "age", 49)
        )));

        return Mono.just(new State(this));
    }
}
