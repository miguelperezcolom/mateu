package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.SplitLayout;
import io.mateu.uidl.data.SplitLayoutOrientation;
import io.mateu.uidl.data.SplitLayoutVariant;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/split")
public class SplitLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Split Layout")
                .content(List.of(

                        new Text("basic"),

                        SplitLayout.builder()
                                .master(new Text("Master"))
                                .detail(new Text("Detail"))
                                .build(),


                        new Text("vertical"),

                        SplitLayout.builder()
                                .master(new Text("Master"))
                                .detail(new Text("Detail"))
                                .orientation(SplitLayoutOrientation.vertical)
                                .build(),

                        new Text("small"),

                        SplitLayout.builder()
                                .master(new Text("Master"))
                                .detail(new Text("Detail"))
                                .variant(SplitLayoutVariant.small)
                                .build(),

                        new Text("minimal"),

                        SplitLayout.builder()
                                .master(new Text("Master"))
                                .detail(new Text("Detail"))
                                .variant(SplitLayoutVariant.minimal)
                                .build(),


                        new Text("")
                ))
                .style("width: 100%;")
                .build();
    }

}
