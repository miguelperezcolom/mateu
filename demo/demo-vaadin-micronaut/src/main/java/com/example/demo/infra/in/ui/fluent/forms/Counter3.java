package com.example.demo.infra.in.ui.fluent.forms;


import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

@Route("/forms/counter3")
public class Counter3 implements ComponentTreeSupplier {

    int count = 0;

    void increment() {
        count++;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return new VerticalLayout(
                new Text("${state.count}"),
                new Button("Increment")
        );
    }

}