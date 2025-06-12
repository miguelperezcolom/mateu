package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Field;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Button;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

import java.util.List;

@Route("/fluent-app/forms/basic")
public class BasicForm implements FormSupplier, HandlesActions {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder() // vertical layout as default container for children
                .id("form_id")
                .title("title")
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
                                new Button("Button 1", "button1_action"), new Button("Button 2", "button2_action")))
                .buttons(List.of(new Button("Button 3", "button3_action")))
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
                                                                .build(),
                                                        Field.builder()
                                                                .id("age")
                                                                .label("Age")
                                                                .dataType(FieldDataType.integer)
                                                                .required(false)
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

        System.out.println("received action: " + actionId);


        return Mono.just("hola");
    }
}
