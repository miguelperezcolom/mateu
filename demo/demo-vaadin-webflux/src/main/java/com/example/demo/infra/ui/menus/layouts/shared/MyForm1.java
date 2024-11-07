package com.example.demo.infra.ui.menus.layouts.shared;

import io.mateu.uidl.core.data.ResultType;
import io.mateu.uidl.core.interfaces.Message;
import io.mateu.uidl.core.annotations.MainAction;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Getter@Setter
public class MyForm1 {

    String name;

    int age;

    @MainAction
    public Message submit() {
        // send the email
        return new Message(
                ResultType.Success,
                "Form submitted",
                "You entered " + name + ", " + age + " before submitting.", 5000);
    }

}
