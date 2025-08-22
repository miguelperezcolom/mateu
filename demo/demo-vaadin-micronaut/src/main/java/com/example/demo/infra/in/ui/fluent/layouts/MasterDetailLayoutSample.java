package com.example.demo.infra.in.ui.fluent.layouts;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.MasterDetailLayout;
import io.mateu.uidl.data.SplitLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/layouts/master-detail")
public class MasterDetailLayoutSample implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Mater-detail Layout")
                .content(List.of(
                        new SplitLayout(

                                MasterDetailLayout.builder()
                                        .master(new Text("Master iugfiye eufefge wfug f feifgeiufgewuif wef efg egf efugeu wefg weifg feg ewifg weg "))
                                        .detail(new Text("Detail"))
                                        .build(),

                                new Text("")
                        )
                        ))
                .build();
    }
}
