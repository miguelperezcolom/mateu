package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/card")
public class CardComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Card")
                .content(List.of(

                        new Text("empty"),

                        Card.builder()
                                .build(),

                        new Text("title"),

                        Card.builder()
                                .title("Title")
                                .build(),

                        new Text("title and subtitle"),

                        Card.builder()
                                .title("Title")
                                .subtitle("Subtitle")
                                .build(),

                        new Text("")
                ))
                .build();
    }
}
