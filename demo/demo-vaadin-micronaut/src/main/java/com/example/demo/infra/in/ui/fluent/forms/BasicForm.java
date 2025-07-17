package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.interfaces.ReactiveHandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

import java.util.List;

@Route("/fluent-app/forms/basic")
public class BasicForm implements ComponentTreeSupplier, ReactiveHandlesActions {

    String name = "Mateu";
    int age = 17;

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
    public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {

        System.out.println("received action: " + actionId);

        return Mono.just(this);
    }
}
