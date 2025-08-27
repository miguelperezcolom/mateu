package com.example.demo.infra.in.ui.fluent.crudls;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnValueChangeTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Route("/fluent-app/crudls/styled")
@Slf4j
public class StyledCrudl implements ComponentTreeSupplier, HasTriggers, HandlesActions {

    boolean wrapCellContent;
    boolean compact;
    boolean noBorder;
    boolean noRowBorder;
    boolean columnBorders;
    boolean rowStripes;
    String vaadinGridCellBackground = "--lumo-base-color";
    String vaadinGridCellPadding = "--lumo-space-xs";
    boolean allRowsVisible;
    int height;

    @Override
    public Component component(HttpRequest httpRequest) {
        return VerticalLayout.builder()
                .content(List.of(
                        FormLayout.builder()
                                .content(List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("wrapCellContent")
                                                                        .label("Wrap Cell Content")
                                                                        .dataType(FieldDataType.bool)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("compact")
                                                                        .label("Compact")
                                                                        .dataType(FieldDataType.bool)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("noBorder")
                                                                        .label("No Border")
                                                                        .dataType(FieldDataType.bool)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("noRowBorder")
                                                                        .label("No Row Border")
                                                                        .dataType(FieldDataType.bool)
                                                                        .build()
                                                        ))
                                                                .build(),
                                        FormRow.builder()
                                                .content(List.of(
                                                        FormField.builder()
                                                                .id("columnBorders")
                                                                .label("Column Borders")
                                                                .dataType(FieldDataType.bool)
                                                                .build(),
                                                        FormField.builder()
                                                                .id("rowStripes")
                                                                .label("Row Stripes")
                                                                .dataType(FieldDataType.bool)
                                                                .build(),
                                                        FormField.builder()
                                                                .id("allRowsVisible")
                                                                .label("All Rows Visible")
                                                                .dataType(FieldDataType.bool)
                                                                .build(),
                                                        FormField.builder()
                                                                .id("height")
                                                                .label("Height in px")
                                                                .dataType(FieldDataType.integer)
                                                                .build()
                                                ))
                                                .build()
                                ))
                                .labelsAside(true)
                                .style("width: 100%;")
                                .maxColumns(4)
                                .autoResponsive(true)
                                .build(),
                        new BasicCrudl()
                                .withNoBorder(noBorder)
                                .withRowStripes(rowStripes)
                                .withNoRowBorder(noRowBorder)
                                .withColumnBorders(columnBorders)
                                .withCompact(compact)
                                .withWrapCellContent(wrapCellContent)
                                .withVaadinGridCellBackground(vaadinGridCellBackground)
                                .withVaadinGridCellPadding(vaadinGridCellPadding)
                                .withAllRowsVisible(allRowsVisible)
                                .withHeight(height)
                ))
                .style("width: 100%;")
                .build();
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(
                OnValueChangeTrigger.builder()
                        .actionId("update")
                        .build()
        );
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        return this;
    }
}
