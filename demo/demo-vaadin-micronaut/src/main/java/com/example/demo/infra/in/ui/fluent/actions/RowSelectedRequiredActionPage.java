package com.example.demo.infra.in.ui.fluent.actions;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasActions;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveCrudlBackend;
import io.micronaut.serde.annotation.Serdeable;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;


record Filters(int age) {}
@Serdeable
record Row(String name, int age) {}

@Route("/fluent-app/actions/row-selected-required")
@Slf4j
public class RowSelectedRequiredActionPage implements ComponentTreeSupplier, ReactiveCrudlBackend<Filters, Row>, HasActions {

    @JsonIgnore
    List<Row> allItems = List.of(
            new Row("Mateu", 17),
            new Row("Antonia", 49)
    );

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Row selected required")
                .content(List.of(

                        Crudl.builder() // vertical layout as default container for children
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
                                                .build(),
                                        GridColumn.builder()
                                                .id("age")
                                                .label("Age")
                                                .build()
                                ))
                                .onRowSelectionChangedActionId("selection-changed")
                                .header(List.of(
                                        Button.builder()
                                                .label("Do something")
                                                .actionId("xx")
                                                .build()
                                ))
                                .emptyStateMessage("Please search.")
                                .rowsSelectionEnabled(true)
                                .build()

                ))
                .build();
    }


    @Override
    public Class<Filters> filtersClass() {
        return Filters.class;
    }

    @Override
    public Mono<CrudlData<Row>> search(String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
        log.info("selected rows are {}", httpRequest.getSelectedRows(Row.class));
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
        return Mono.just(new CrudlData<>(new io.mateu.uidl.data.Page<>(
                searchText + "#" + filters.age(),
                pageable.size(),
                pageable.page(),
                filteredItems.size(),
                filteredItems.stream().skip((long) pageable.size() * pageable.page()).limit(pageable.size()).toList()
        ),
                "No items found. Please try again."));
    }

    @Override
    public boolean supportsAction(String actionId) {
        return ReactiveCrudlBackend.super.supportsAction(actionId) || "xx".equals(actionId);
    }

    @Override
    public Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
        if ("xx".equals(actionId)) {
            log.info("selected rows are {}", httpRequest.getSelectedRows(Row.class));
            return Flux.empty();
        }
        return ReactiveCrudlBackend.super.handleAction(actionId, httpRequest);
    }

    @Override
    public List<Action> actions() {
        return List.of(
                Action.builder()
                        .id("xx")
                        .rowsSelectedRequired(true)
                        .build()
        );
    }
}
