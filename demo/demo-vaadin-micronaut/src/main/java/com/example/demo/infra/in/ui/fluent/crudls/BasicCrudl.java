package com.example.demo.infra.in.ui.fluent.crudls;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CrudlBackend;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;
import io.micronaut.serde.annotation.Serdeable;
import lombok.With;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ButtonComponentToDtoMapper.mapButtonToDto;

record Filters(int age) {}
@Serdeable
record Row(
        String name,
        int age,
        double balance,
        Amount balance2,
        Status status,
        boolean spanish,
        String icon,
        String link,
        String longText,
        ComponentDto detail) {}

@Route("/fluent-app/crudls/basic")
@Slf4j
@With
public class BasicCrudl implements ComponentTreeSupplier, CrudlBackend<Filters, Row>, TriggersSupplier {

    public BasicCrudl() {
    }

    public BasicCrudl(boolean wrapCellContent, boolean compact, boolean noBorder, boolean noRowBorder, boolean columnBorders, boolean rowStripes, String vaadinGridCellBackground, String vaadinGridCellPadding, int height, boolean allRowsVisible, List<Row> allItems) {
        this.wrapCellContent = wrapCellContent;
        this.compact = compact;
        this.noBorder = noBorder;
        this.noRowBorder = noRowBorder;
        this.columnBorders = columnBorders;
        this.rowStripes = rowStripes;
        this.vaadinGridCellBackground = vaadinGridCellBackground;
        this.vaadinGridCellPadding = vaadinGridCellPadding;
        this.height = height;
        this.allRowsVisible = allRowsVisible;
        this.allItems = allItems;
    }

    @JsonIgnore
    boolean wrapCellContent;
    @JsonIgnore
    boolean compact;
    @JsonIgnore
    boolean noBorder;
    @JsonIgnore
    boolean noRowBorder;
    @JsonIgnore
    boolean columnBorders;
    @JsonIgnore
    boolean rowStripes;
    @JsonIgnore
    String vaadinGridCellBackground = "--lumo-base-color";
    @JsonIgnore
    String vaadinGridCellPadding = "--lumo-space-xs";
    @JsonIgnore
    int height;
    @JsonIgnore
    boolean allRowsVisible;


    @JsonIgnore
    List<Row> allItems = List.of(
            new Row(
                    "Mateu",
                    17,
                    253671.21,
                    new Amount("EUR", 1001024.31),
                    new Status(StatusType.SUCCESS, "Active"),
                    true,
                    IconKey.Sword.iconName,
                    "htts://mateu.io",
                    "ibiu weoi weih weihd ioweh iofh woiefhiowef hwioefh iewfo fe ioewfh weif eiwofefh ehiwf",
                    mapButtonToDto(Button.builder()
                            .label("Hola")
                            .actionId("action-id-1")
                            .parameters(new Params("Mateu", 17))
                            .build())
                    ),
            new Row(
                    "Antonia",
                    49,
                    10,
                    new Amount("EUR", 302122),
                    new Status(StatusType.WARNING, "Applying"),
                    false,
                    IconKey.Newspaper.iconName,
                    "htts://mateu.io",
                    "ibiu weoi weih weihd wfowejf weofowep fowef ioweh iofh woiefhiowef hwioefh iewfo fe ioewfh weif eiwofefh ehiwf",
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
                                .tooltipPath("longText")
                                .build(),
                        GridColumn.builder()
                                .id("balance2")
                                .dataType(FieldDataType.money)
                                .label("Balance 2")
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
                                .id("longText")
                                .dataType(FieldDataType.string)
                                .label("Long text")
                                .build()
                ))
                .emptyStateMessage("Please search.")
                .wrapCellContent(wrapCellContent)
                .rowStripes(rowStripes)
                .columnBorders(columnBorders)
                .noRowBorder(noRowBorder)
                .noBorder(noBorder)
                .compact(compact)
                .allRowsVisible(allRowsVisible)
                .gridStyle(height > 0?"height: " + height + "px;":null)
                .detailPath("detail")
                .useButtonForDetail(true)
                .rowsSelectionEnabled(true)
                .style("width: 100%;")
                .toolbar(List.of(
                        Button.builder()
                                .label("Action 1")
                                .actionId("xxx")
                                .build()
                ))
                .onRowSelectionChangedActionId("row-selected")
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
                searchText + "#" + filters.age(),
                pageable.size(),
                pageable.page(),
                filteredItems.size(),
                filteredItems.stream().skip((long) pageable.size() * pageable.page()).limit(pageable.size()).toList()
        ),
                "No items found. Please try again.");
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(new OnLoadTrigger("search"));
    }

    @Override
    public boolean supportsAction(String actionId) {
        if ("row-selected".equals(actionId)) {
            return true;
        }
        return CrudlBackend.super.supportsAction(actionId);
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("row-selected".equals(actionId)) {
            return Message.builder()
                    .text("row selected" + httpRequest.getSelectedRows(Row.class))
                    .build();
        }
        return CrudlBackend.super.handleAction(actionId, httpRequest);
    }
}
