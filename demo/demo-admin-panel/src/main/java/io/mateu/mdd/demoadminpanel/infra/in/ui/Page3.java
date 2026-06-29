package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.UICommand;
import lombok.ToString;

import java.util.List;

@Route(value = "/page3", parentRoute = "")
@ToString
@FoldedLayout
@Action(shortcut = "ctrl+f2", id = "save")
@ConfirmOnNavigationIfDirty
public class Page3 {

    @Section("sf0")
    String name = "Mateu";

    int age =  18;


    @Section("sf2")
    Subform1 subform1 = new Subform1("xxxx", "iiii");


    @Section("sf1")
    Subform2 subform2;


    @Toolbar
    Object save() {
        return List.of(Message.builder()
                .variant(NotificationVariant.success)
                .text("Saved " + this)
                .build(),
                UICommand.markAsClean());
    }

}
