package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.VirtualList;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;
import java.util.Map;

@Route("/fluent-app/components/virtual-list")
public class VirtualListComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Virtual list")
                .content(List.of(
                        VirtualList.builder()
                                .page(new Page<>(1, 3, List.of(
                                        Map.of("id", "1", "name", "Mateu", "age", "17"),
                                        Map.of("id", "2", "name", "Antònia", "age", "49"),
                                        Map.of("id", "3", "name", "Miguel", "age", "56")
                                )))
                                .build()
                ))
                .build();
    }
}
