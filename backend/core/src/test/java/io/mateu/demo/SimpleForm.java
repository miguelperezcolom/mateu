package io.mateu.demo;

import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.annotations.MateuUI;
import io.mateu.dtos.ResultType;

import java.util.UUID;

@MateuUI("/simpleform")
public class SimpleForm {

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
