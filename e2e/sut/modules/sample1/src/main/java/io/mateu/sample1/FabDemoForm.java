package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/fab")
@Title("FAB Demo Form")
@Getter
@Setter
public class FabDemoForm {

    String name;

    @Fab(icon = "vaadin:plus", label = "Add Item", order = 0)
    public Message addItem() {
        return new Message("Item added!");
    }

    @Fab(icon = "vaadin:edit", label = "Edit Item", order = 1)
    public Message editItem() {
        return new Message("Item edited!");
    }

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
