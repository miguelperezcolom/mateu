package com.example.demo;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

@MateuUI("/counter")
public class Counter implements ComponentTreeSupplier {

    int count = 0;

    Counter increment() {
        count++;
        return this;
    }

    @Override
    public Component getComponent(HttpRequest httpRequest) {
        return new VerticalLayout(
                new Text("${data.count}"),
                new Button("Increment", () -> new Data(increment()))
        );
    }
}
