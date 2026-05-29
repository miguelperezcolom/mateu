package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Message;

public record Subform2(Sex sex, Religion religion) {

    @Button
    Object test2() {
        return Message.builder()
                .text("test2 on " + this)
                .build();
    }

}
