package com.example.demo.infra.in.ui.fluent.forms;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

import static io.mateu.core.infra.JsonSerializer.toJson;

@Route(value="/forms/numeric-fields", parentRoute="")
public class FormNumericFieldsComponentPage implements ComponentTreeSupplier, ActionHandler {

    Range range = new Range(10, 30);

    Amount money = new Amount("EUR", 20.66);

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Form fields")
                .content(List.of(
                        new Text("${JSON.stringify(state)}"),
                        FormLayout.builder()
                                .autoResponsive(true)
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("integer")
                                                                        .label("Integer")
                                                                        .dataType(FieldDataType.integer)
                                                                        .stepButtonsVisible(true)
                                                                        .step(2)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("decimal")
                                                                        .label("Decimal")
                                                                        .dataType(FieldDataType.number)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("money")
                                                                        .label("Money")
                                                                        .dataType(FieldDataType.money)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("money")
                                                                        .label("Money")
                                                                        .dataType(FieldDataType.money)
                                                                        .readOnly(true)
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("integer")
                                                                        .label("Integer/Slider")
                                                                        .dataType(FieldDataType.integer)
                                                                        .stereotype(FieldStereotype.slider)
                                                                        .sliderMin(-5)
                                                                        .sliderMax(5)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("integer")
                                                                        .label("Integer/Stars")
                                                                        .dataType(FieldDataType.integer)
                                                                        .stereotype(FieldStereotype.stars)
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("range")
                                                                        .label("Range")
                                                                        .dataType(FieldDataType.range)
                                                                        .sliderMin(0)
                                                                        .sliderMax(50)
                                                                        .build()
                                                        ))
                                                        .build()

                                        )
                                )
                                .build(),
                        Button.builder()
                                .label("Test")
                                .actionId("test")
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        System.out.println(toJson(this));
        return null;
    }
}
