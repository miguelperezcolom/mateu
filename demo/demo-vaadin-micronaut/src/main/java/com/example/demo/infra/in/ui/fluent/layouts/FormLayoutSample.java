package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

import static com.example.demo.infra.in.ui.fluent.layouts.LayoutSampleHelper.buildPanel;

@Route("/fluent-app/layouts/form")
public class FormLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Form Layout")
                .content(List.of(

                        FormLayout.builder()
                                .content(List.of(
                                        buildPanel(),
                                        buildPanel(),
                                        buildPanel()
                                ))
                                .columns(2)
                        .build()

                ))
                .style("width: 100%;")
                .cssClasses("test")
                .build();
    }
}
