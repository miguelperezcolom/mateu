package com.example.demo.infra.ui.menus.components.forms.layouts;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.HorizontallyArranged;

import java.util.List;

public class WithHorizontalLayoutForm {

    String assessment;

    @HorizontallyArranged
    List content = List.of(
            new Tab1("Mateu", 17),
            new Tab2("", "", "")
    );


    @Action
    void assess() {
        assessment = "" + ((Tab1)content.get(0)).name() + ", " +
                ((Tab2)content.get(1)).address();
    }

}
