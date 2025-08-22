package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/text")
public class TextComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Text")
                .content(List.of(
                    new Text("Hola default"),
                        new Text("Hola H1", TextContainer.h1),
                        new Text("Hola H2", TextContainer.h2),
                        new Text("Hola H3", TextContainer.h3),
                        new Text("Hola H4", TextContainer.h4),
                        new Text("Hola H5", TextContainer.h5),
                        new Text("Hola H6", TextContainer.h6),
        new Text("Hola p", TextContainer.p)
                ))
                .build();
    }
}
