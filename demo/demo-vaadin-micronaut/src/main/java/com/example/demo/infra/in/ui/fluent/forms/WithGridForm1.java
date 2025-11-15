package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static io.mateu.core.infra.JsonSerializer.toJson;

@Serdeable
record Person(String name, int age) {

}

@Route("/forms/with-grid1")
public class WithGridForm1 implements ComponentTreeSupplier, ActionHandler, ActionSupplier, TriggersSupplier {

    String name = "Mateu";
    int age = 17;

    List<Person> people = new ArrayList<>();

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder() // vertical layout as default container for children
                .id("form_id")
                .title(name + " " + age)
                .subtitle("subtitle")
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
                                        .autoResponsive(true)
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
                                                                .initialValue(name)
                                                                .build(),
                                                        FormField.builder()
                                                                .id("age")
                                                                .label("Age")
                                                                .dataType(FieldDataType.integer)
                                                                .required(false)
                                                                .initialValue(age)
                                                                .build(),
                                                        Grid.builder()
                                                                .content(List.of(
                                                                        GridColumn.builder().id("name").label("Name").build(),
                                                                        GridColumn.builder().id("age").label("Age").build()
                                                                ))
                                                                .page(new io.mateu.uidl.data.Page<Object>("", 10, 1, people.size(), Arrays.asList(people.toArray())))
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

        return Flux.just(this);
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
