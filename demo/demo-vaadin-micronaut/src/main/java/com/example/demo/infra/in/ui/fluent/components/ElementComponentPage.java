package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;
import java.util.Map;

@Route(value="/components/element", parentRoute="^$")
public class ElementComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Element")
                .content(List.of(
                    new Element("div", Map.of("style", "background-color: green;"), "Hola!")
                ))
                .build();
    }
}
