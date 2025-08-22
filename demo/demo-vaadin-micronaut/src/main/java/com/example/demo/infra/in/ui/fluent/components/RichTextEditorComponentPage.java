package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/rich-text-editor")
public class RichTextEditorComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Rich text editor")
                .content(List.of(
                        FormField.builder()
                                .id("name")
                                .label("Name")
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.richText)
                                .build()
                ))
                .build();
    }
}
