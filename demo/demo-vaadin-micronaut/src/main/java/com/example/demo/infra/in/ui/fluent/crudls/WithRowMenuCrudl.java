package com.example.demo.infra.in.ui.fluent.crudls;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Map;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CrudlBackend;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;
import io.micronaut.serde.annotation.Serdeable;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ButtonComponentToDtoMapper.mapButtonToDto;

record Filters3(int age) {}
@Serdeable
record Row3(
        String name,
        int age,
        double balance,
        Amount balance2,
        Status status,
        boolean spanish,
        String icon,
        String link,
        ColumnActionGroup actions,
        ComponentDto button
        ) {}

@Serdeable
record Params(String name, int age) {

}

@Route("/fluent-app/crudls/with-row-menu")
@Slf4j
public class WithRowMenuCrudl implements ComponentTreeSupplier, CrudlBackend<Filters3, Row3>, HasTriggers {

    @JsonIgnore
    List<Row3> allItems = List.of(
            new Row3(
                    "Mateu",
                    17,
                    253671.21,
                    new Amount("EUR", 1001024.31),
                    new Status(StatusType.SUCCESS, "Active"),
                    true,
                    IconKey.Sword.iconName,
                    "htts://mateu.io",
                    new ColumnActionGroup(
                                    new ColumnAction[] {
                                            new ColumnAction("unblockRow", "Unblock", IconKey.Unlock.iconName),
                                            new ColumnAction("deleteRow", "Delete", IconKey.Trash.iconName)
                                    }
                                    ),
                    mapButtonToDto(Button.builder()
                            .label("Hola")
                            .actionId("action-id-1")
                            .parameters(new Params("Mateu", 17))
                            .build())
            ),
            new Row3(
                    "Antonia",
                    49,
                    10,
                    new Amount("EUR", 302122),
                    new Status(StatusType.WARNING, "Applying"),
                    false,
                    IconKey.Newspaper.iconName,
                    "htts://mateu.io",
                    new ColumnActionGroup(
                            new ColumnAction[] {
                                    new ColumnAction("blockRow", "Block", IconKey.Lock.iconName)
                            }
                            ),
                    mapButtonToDto(Button.builder()
                            .label("Adiós")
                            .actionId("action-id-2")
                            .parameters(new Params("Antonia", 49))
                            .build())
            )
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
                                .dataType(FieldDataType.integer)
                                .label("Age")
                                .sortable(true)
                                .build(),
                        GridColumn.builder()
                                .id("spanish")
                                .dataType(FieldDataType.bool)
                                .label("Spanish")
                                .build(),
                        GridColumn.builder()
                                .id("icon")
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.icon)
                                .label("Icon")
                                .build(),
                        GridColumn.builder()
                                .id("link")
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.link)
                                .label("Link")
                                .build(),
                        GridColumn.builder()
                                .id("actions")
                                .dataType(FieldDataType.menu)
                                .label("Actions")
                                .build(),
                        GridColumn.builder()
                                .id("button")
                                .dataType(FieldDataType.component)
                                .label("Button")
                                .build()
                ))
                .emptyStateMessage("Please search.")
                .style("width: 100%;")
                .build();
    }

    @Override
    public Class<Filters3> filtersClass() {
        return Filters3.class;
    }

    @Override
    public CrudlData<Row3> search(String searchText, Filters3 filters, Pageable pageable, HttpRequest httpRequest) {
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
                searchText + "#" + filters.age(),
                pageable.size(),
                pageable.page(),
                filteredItems.size(),
                filteredItems.stream().skip((long) pageable.size() * pageable.page()).limit(pageable.size()).toList()
        ),
                "No items found. Please try again.");
    }

    @Override
    public boolean supportsAction(String actionId) {
        if (List.of("unblockRow", "blockRow", "deleteRow", "action-id-1", "action-id-2").contains(actionId)) {
            return true;
        }
        return CrudlBackend.super.supportsAction(actionId);
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if (List.of("unblockRow", "blockRow", "deleteRow").contains(actionId)) {
            var row = httpRequest.getClickedRow(Row3.class);
            log.info(actionId + " row {}", row);
            return Message.builder()
                    .text(actionId + " on " + row.name())
                    .build();
        }
        if (List.of("action-id-1", "action-id-2").contains(actionId)) {
            var params = httpRequest.getParameters(Params.class);
            log.info(actionId + " on {}", this);
            return Message.builder()
                    .text(actionId + " on " + (params != null?params.name():null))
                    .build();
        }
        return CrudlBackend.super.handleAction(actionId, httpRequest);
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(new OnLoadTrigger("search"));
    }
}
