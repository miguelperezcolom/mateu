package com.example.demo;

import com.example.demo.jsonschemabased.Scanner;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.domain.Humanizer;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

import static com.example.demo.jsonschemabased.Mapper.getDataType;
import static com.example.demo.jsonschemabased.Mapper.getInitialValue;
import static com.example.demo.jsonschemabased.Mapper.getOptions;
import static com.example.demo.jsonschemabased.Mapper.getStereotype;

@MateuUI("/json-schema")
public class JsonSchemaBased implements ComponentTreeSupplier, RouteHandler {

    private String route = "";

    @Override
    public Mono<?> handleRoute(String route, HttpRequest httpRequest) {
        System.out.println("route is " + route);
        this.route = route;
        return Mono.just(this);
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        if ("/".equals(route)) {
            return getIndexComponent();
        }
        return getFormComponent();
    }

    @SneakyThrows
    private Component getFormComponent() {
        var schema = new ObjectMapper().readValue(this.getClass().getResourceAsStream("/schemas/" + route),
                Map.class);
        return Form.builder()
                .title(route)
                .content(List.of(FormLayout.builder()
                        .content(
                        ((Map<String, Object>)schema.get("properties")).entrySet().stream()
                                .map(property -> (Component) FormField.builder()
                                        .dataType(getDataType(property))
                                        .stereotype(getStereotype(property))
                                        .id(property.getKey())
                                        .label(Humanizer.toUpperCaseFirst(property.getKey()))
                                        .initialValue(getInitialValue(property))
                                        .options(getOptions(property))
                                        .build()
                                ).toList()
                ).build()))
                .build();
    }

    @SneakyThrows
    private Component getIndexComponent() {
        return Form.builder()
                .content(List.of(
                        new VerticalLayout(
                                new Scanner().getResourceFiles("schemas").stream()
                                        .map(fileName -> (Component)
                                                new Anchor(fileName,
                                                        "/json-schema/" + fileName))
                                        .toList()
                        )
                ))
                .build();
    }


}
