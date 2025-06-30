package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Map;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/map")
public class MapComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Map")
                .content(List.of(
                        Map.builder()
                                .position("eidjeidjeijd")
                                .zoom("14")
                                .build()
                ))
                .build();
    }
}
