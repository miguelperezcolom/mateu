package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import lombok.ToString;

@Route(value = "/page3", parentRoute = "/home2")
@ToString
public class Page3 {

    String name;

    int age;


    @Section("sf2")
    Subform1 subform1;


    @Section("sf1")
    Subform2 subform2;


    @Toolbar
    Object save() {
        return Message.builder()
                .variant(NotificationVariant.success)
                .text("Saved " + this)
                .build();
    }

}
