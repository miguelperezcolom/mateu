package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Orientation;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.TabLayoutVariant;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route(value="/layouts/tab", parentRoute="^$")
public class TabLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Tab Layout")
                .content(List.of(

                        new Text("basic"),

                        TabLayout.builder()
                                .tabs(List.of(
                                        new Tab("Tab 1", new Text("Tab 1")),
                                        new Tab("Tab 2", new Text("Tab 2")),
                                        new Tab("Tab 3", new Text("Tab 3"))
                                ))
                                .build(),


                        new Text("vertical"),

                        TabLayout.builder()
                                .tabs(List.of(
                                        new Tab("Tab 1", new Text("Tab 1")),
                                        new Tab("Tab 2", new Text("Tab 2")),
                                        new Tab("Tab 3", new Text("Tab 3"))
                                ))
                                .orientation(Orientation.vertical)
                                .build(),

                        new Text("centered"),

                        TabLayout.builder()
                                .tabs(List.of(
                                        new Tab("Tab 1", new Text("Tab 1")),
                                        new Tab("Tab 2", new Text("Tab 2")),
                                        new Tab("Tab 3", new Text("Tab 3"))
                                ))
                                .variant(TabLayoutVariant.centered)
                                .style("width: 30rem;")
                                .build(),

                        new Text("equal-width"),

                        TabLayout.builder()
                                .tabs(List.of(
                                        new Tab("Tab 1", new Text("Tab 1")),
                                        new Tab("Tab 2", new Text("Tab 2")),
                                        new Tab("Tab 3", new Text("Tab 3"))
                                ))
                                .variant(TabLayoutVariant.equalWidth)
                                .style("width: 30rem;")
                                .build(),

                        new Text("")

                ))
                .build();
    }
}
