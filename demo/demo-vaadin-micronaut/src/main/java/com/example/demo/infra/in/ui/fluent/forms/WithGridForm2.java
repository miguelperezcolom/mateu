package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasActions;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

import static io.mateu.core.infra.JsonSerializer.toJson;

@Route("/fluent-app/forms/with-grid2")
@Slf4j
public class WithGridForm2 implements ComponentTreeSupplier, HandlesActions, HasActions, HasTriggers {

    String name = "Mateu";
    int age = 17;

    List<Person> people = new ArrayList<>(List.of(new Person("Mateu", 17)));

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder() // vertical layout as default container for children
                .id("form_id")
                .title(name + " " + age)
                .subtitle("subtitle")
                .pageTitle("page_title")
                .favicon("favicon")
                .toolbar(
                        List.of(
                                Button.builder()
                                        .label("Button 1")
                                        .actionId("button1_action")
                                        .build(),
                                Button.builder()
                                        .label("Button 2")
                                        .actionId("button2_action")
                                        .build()))
                .buttons(List.of(Button.builder()
                        .label("Button 3")
                        .actionId("button3_action")
                        .build()))
                .header(List.of()) // will be placed in header, below title, subtitle and toolbar
                .content(
                        List.of(
                                FormLayout.builder()
                                        .id("form_layout_id")
                                        .content(
                                                List.of(
                                                        FormField.builder()
                                                                .id("name")
                                                                .label("Name")
                                                                .dataType(FieldDataType.string)
                                                                .required(true)
                                                                .description("description")
                                                                .placeholder("placeholder")
                                                                .cssClasses("css_classes")
                                                                .build(),
                                                        FormField.builder()
                                                                .id("age")
                                                                .label("Age")
                                                                .dataType(FieldDataType.integer)
                                                                .required(false)
                                                                .build(),
                                                        Grid.builder()
                                                                .id("people")
                                                                .content(List.of(
                                                                        GridColumn.builder().id("name").label("Name").build(),
                                                                        GridColumn.builder().id("age").label("Age").build()
                                                                ))
                                                                .build()))
                                        .build()))
                .footer(List.of()) // will be placed in footer, between left and right side buttons
                .build();
    }

    @Override
    public boolean supportsAction(String actionId) {
        return !"".equals(actionId);
    }

    @Override
    public Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {

        System.out.println("received action: " + actionId + " " + toJson(this));

        people.add(new Person(name, age));

        return Flux.just(new State(this));
    }

    @Override
    public List<Action> actions() {
        return List.of(Action.builder().id("action_id").build());
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(new OnLoadTrigger("onload_action"));
    }
}
