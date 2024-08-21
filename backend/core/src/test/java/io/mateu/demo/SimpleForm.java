package io.mateu.demo;

import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.annotations.MateuUI;
import io.mateu.dtos.ResultType;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@MateuUI("/simpleform")
@Getter@Setter
public class SimpleForm {

    String name = "Mateu";

    int age = 16;

    @MainAction
    public Message submit() {
        // send the email
        return new Message(
                ResultType.Success,
                "Form submitted",
                "You entered " + name + ", " + age + " before submitting.");
    }

}
