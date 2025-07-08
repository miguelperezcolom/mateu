package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;
import java.util.Map;

@Route("/fluent-app/components/tree-grid")
public class TreeGridComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Tree grid")
                .content(List.of(
                        Grid.builder()
                                .columns(List.of(
                                        new GridColumn("id", "Id"),
                                        new GridColumn("name", "Name"),
                                        new GridColumn("age", "Age")
                                ))
                                .page(new Page<>(1, 2, List.of(
                                                Map.of("id", "1000", "name", "VIP", "children", List.of(
                                                        Map.of("id", "1", "name", "Mateu", "age", "17"),
                                                        Map.of("id", "2", "name", "Antònia", "age", "49")
                                                )),
                                                Map.of("id", "1001", "name", "Regular", "children", List.of(
                                                        Map.of("id", "3", "name", "Miguel", "age", "56")
                                                ))
                                        )
                                ))
                                .tree(true)
                                .build()
                ))
                .build();
    }
}
