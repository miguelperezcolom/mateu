package com.example.demo.infra.in.ui.fluent.forms;


import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

@MateuUI("/counter2")
@Route("/fluent-app/forms/counter2")
public class Counter2 implements ComponentTreeSupplier {

    int count = 0;

    @Override
    public Component component(HttpRequest httpRequest) {
        return new VerticalLayout(
                new Text("${state.count}"),
                new Button("Increment", (Runnable) () -> count++)
        );
    }

}