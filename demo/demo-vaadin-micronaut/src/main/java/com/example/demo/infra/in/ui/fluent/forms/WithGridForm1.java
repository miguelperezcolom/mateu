package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Field;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static io.mateu.core.infra.JsonSerializer.toJson;

@Serdeable
record Person(String name, int age) {

}

@Route("/fluent-app/forms/with-grid1")
@Serdeable
public class WithGridForm1 implements ComponentTreeSupplier, HandlesActions {

    String name = "Mateu";
    int age = 17;

    List<Person> people = new ArrayList<>();

    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder() // vertical layout as default container for children
                .id("form_id")
                .title(name + " " + age)
                .subtitle("subtitle")
                .pageTitle("page_title")
                .favicon("favicon")
                .actions(
                        List.of( // not required, as we can set the actionable when declaring the
                                // buttons
                                Action.builder().id("action_id").build()))
                .triggers(List.of(new OnLoadTrigger("onload_action")))
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
                                                        Field.builder()
                                                                .id("name")
                                                                .label("Name")
                                                                .dataType(FieldDataType.string)
                                                                .required(true)
                                                                .description("description")
                                                                .placeholder("placeholder")
                                                                .cssClasses("css_classes")
                                                                .initialValue(name)
                                                                .build(),
                                                        Field.builder()
                                                                .id("age")
                                                                .label("Age")
                                                                .dataType(FieldDataType.integer)
                                                                .required(false)
                                                                .initialValue(age)
                                                                .build(),
                                                        Grid.builder()
                                                                .columns(List.of(
                                                                        new GridColumn("name", "Name"),
                                                                        new GridColumn("age", "Age")
                                                                ))
                                                                .page(new Page<Object>(1, people.size(), Arrays.asList(people.toArray())))
                                                                .build()))
                                        .build()))
                .footer(List.of()) // will be placed in footer, between left and right side buttons
                .build();
    }

    @Override
    public boolean supportsAction(String actionId) {
        return !"create".equals(actionId);
    }

    @Override
    public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {

        System.out.println("received action: " + actionId + " " + toJson(this));

        people.add(new Person(name, age));

        return Mono.just(this);
    }

    // micronaut's serialization does not like lombok's @Getter and @Setter
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        this.age = age;
    }
    public List<Person> getPeople() {
        return people;
    }
    public void setPeople(List<Person> people) {
        this.people = people;
    }
}
