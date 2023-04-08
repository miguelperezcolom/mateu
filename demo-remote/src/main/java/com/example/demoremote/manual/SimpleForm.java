package com.example.demoremote.manual;

import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.TextArea;
import lombok.Getter;
import lombok.Setter;

@MateuUI("/form")
@Getter@Setter
public class SimpleForm {

    String email;

    String subject;

    @TextArea
    String body;

    @MainAction
    public void send() {
        // send the email
    }

}
