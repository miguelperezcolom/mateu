package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VirtualList;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route(value="/components/virtual-list", parentRoute="^$")
public class VirtualListComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Virtual list")
                .content(List.of(
                        VirtualList.builder()
                                .page(new io.mateu.uidl.data.Page<>("", 10, 1, 3, List.of(
                                        new Text("Item 1"),
                                        new Text("Item 2"),
                                        new Text("Item 3")
                                )))
                                .build()
                ))
                .build();
    }
}
