package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Icon;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;

import java.util.List;

@Route("/fluent-app/components/icon")
public class IconComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Icon")
                .content(List.of(
                    new Icon(IconKey.Form),
                        new Icon(IconKey.Abacus),
                        new Icon(IconKey.Airplane)
                ))
                .build();
    }
}
