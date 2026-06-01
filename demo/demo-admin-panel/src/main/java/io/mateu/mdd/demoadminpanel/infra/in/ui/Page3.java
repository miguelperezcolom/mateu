package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.UICommand;
import lombok.ToString;

import java.util.List;

@Route(value = "/page3", parentRoute = "/home2")
@ToString
@FoldedLayout
@Action(shortcut = "ctrl+f2", id = "save")
@ConfirmOnNavigationIfDirty
public class Page3 {

    String name;

    int age;


    @Section("sf2")
    Subform1 subform1;


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
