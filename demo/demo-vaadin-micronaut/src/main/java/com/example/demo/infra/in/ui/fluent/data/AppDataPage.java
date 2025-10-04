package com.example.demo.infra.in.ui.fluent.data;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.AppData;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;
import java.util.UUID;

class NestedForm implements ComponentTreeSupplier, HandlesActions {

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("add-random-data".equals(actionId)) {
            return new AppData(Map.of("random-data", UUID.randomUUID().toString()));
        }
        if ("noop".equals(actionId)) {
            return this;
        }
        return null;
    }


    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Nested form")
                .toolbar(List.of(
                        Button.builder()
                                .label("Add random data")
                                .actionId("add-random-data")
                                .build(),
                        Button.builder()
                                .label("NOOP")
                                .actionId("noop")
                                .build()
                ))
                .content(List.of(
                        Text.builder()
                                .text("${JSON.stringify(appData)}")
                                .build()
                ))
                .build();
    }
}

@Slf4j
@Route("/fluent-app/data/app-data")
public class AppDataPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("App data")
                .content(List.of(
                        Text.builder()
                                .text("${JSON.stringify(appData)}")
                                .build(),
                        new NestedForm()
                ))
                .build();
    }

}
