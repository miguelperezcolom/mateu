package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Field;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/multi-select-combo-box")
public class MultiSelectComboBoxComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Multi-select combo box")
                .content(List.of(
                        Field.builder()
                                .id("name")
                                .label("Name")
                                .dataType(FieldDataType.array)
                                .stereotype(FieldStereotype.combobox)
                                .build(),
                        Field.builder()
                                .id("list")
                                .label("List box")
                                .dataType(FieldDataType.array)
                                .stereotype(FieldStereotype.listBox)
                                .build()
                ))
                .build();
    }
}
