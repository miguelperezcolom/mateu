package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Message;
import lombok.ToString;

public record Subform1(String address, String city) {

    @Toolbar
    Object test1() {
        return Message.builder()
                .text("test1 on " + this)
                .build();
    }

}
