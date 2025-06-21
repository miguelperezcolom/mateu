package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;
import java.util.Map;

@Route("/fluent-app/components/element")
public class ElementComponentPage implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        return Form.builder()
                .title("Element")
                .content(List.of(
                    new Element("div", Map.of("style", "background-color: green;"), "Hola!")
                ))
                .build();
    }
}
