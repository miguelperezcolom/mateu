package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route(value="/components/date-time-picker", parentRoute="^$")
public class DateTimePickerComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Date time picker")
                .content(List.of(
                        FormField.builder()
                                .id("name")
                                .label("Name")
                                .dataType(FieldDataType.dateTime)
                                .build()
                ))
                .build();
    }
}
