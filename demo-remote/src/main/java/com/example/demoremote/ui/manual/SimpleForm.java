package com.example.demoremote.ui.manual;

import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.TextArea;
import lombok.Getter;
import lombok.Setter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

@MateuUI("/form")
@Service@Scope("prototype")
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
