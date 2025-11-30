package com.example.demo.infra.in.ui.fluent.rules;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;
import java.util.Map;

@Route(value="/rules/enabled-from-backend", parentRoute="^$")
public class EnableFromBackendPage implements ComponentTreeSupplier {

    boolean buttonDisabled = false;
    boolean fieldDisabled = false;

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Enabled from backend")
                .content(List.of(
                        new Button("A Button"),
                        FormField.builder()
                                .id("aField")
                                .dataType(FieldDataType.string)
                                .label("A Field")
                                .build(),
                        new Button("Toggle", () ->
                                new Data(
                                        Map.of(
                                                "aButton.disabled", buttonDisabled = !buttonDisabled,
                                                "aField.disabled", fieldDisabled = !fieldDisabled
                                        ),
                                        this))
                ))
                .build();
    }
}
