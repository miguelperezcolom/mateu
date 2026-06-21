package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/badge-demo")
@Title("Badge Demo Form")
@Getter
@Setter
public class BadgeDemoForm {

    String name;

    boolean active = true;

    @Badge
    boolean premium = false;

    @BadgeInHeader(label = "Active", color = "success")
    boolean headerBadge = true;

    @Button
    public Message toggle() {
        active = !active;
        return new Message("Toggled!");
    }

}
