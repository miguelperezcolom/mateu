package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route(value="/components/train", parentRoute="^$")
public class TrainComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Train")
                .content(List.of(

                ))
                .build();
    }
}
