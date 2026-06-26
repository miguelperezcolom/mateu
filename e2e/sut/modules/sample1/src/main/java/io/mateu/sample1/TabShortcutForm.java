package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/tab-shortcuts")
@Title("Tab Shortcut Form")
@Tabs
@Getter
@Setter
public class TabShortcutForm {

    // One single tab strip: no per-tab @Section (see the @Tab shortcut gotcha),
    // so all three tabs share one vaadin-tabsheet and carry their shortcut.
    @Tab(value = "General", shortcut = "alt+1")
    String firstName;

    @Tab(value = "Contact", shortcut = "alt+2")
    String email;

    @Tab(value = "Notes", shortcut = "alt+3")
    String notes;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
