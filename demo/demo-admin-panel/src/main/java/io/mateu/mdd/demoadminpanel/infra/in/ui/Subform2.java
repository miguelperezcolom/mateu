package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;

public record Subform2(@Stereotype(FieldStereotype.radio) Sex sex, Religion religion) {

    @Button
    @Action(shortcut = "ctrl+f1", confirmationRequired = true)
    Object test2() {
        return Message.builder()
                .text("test2 on " + this)
                .build();
    }

}
