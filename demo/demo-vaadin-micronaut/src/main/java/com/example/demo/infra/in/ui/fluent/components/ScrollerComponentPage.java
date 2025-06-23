package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Scroller;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.ArrayList;
import java.util.List;

@Route("/fluent-app/components/scroller")
public class ScrollerComponentPage implements FormSupplier {
    @Override
    public Form getForm(HttpRequest httpRequest) {
        var content = new ArrayList<Component>();
        for (int i = 0; i < 100; i++) {
            content.add(new Text("Hola " + i));
        }
        return Form.builder()
                .title("Scroller")
                .content(List.of(
                        Scroller.builder()
                                .content(HorizontalLayout.builder()
                                        .content(content)
                                        .build())
                                .build()
                ))
                .build();
    }
}
