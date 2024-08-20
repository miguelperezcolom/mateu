package com.example.demo.infra.ui.menus.layouts.shared;

import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.dtos.ResultType;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

@Slf4j
@Getter@Setter
public class MyForm1 {

    String name;

    int age;

    @MainAction
    public Message submit() {
        // send the email
        return new Message(
                UUID.randomUUID().toString(),
                ResultType.Success,
                "Form submitted",
                "You entered " + name + ", " + age + " before submitting.");
    }

}
