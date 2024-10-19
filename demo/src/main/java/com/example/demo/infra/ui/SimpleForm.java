package com.example.demo.infra.ui;

import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionType;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.annotations.MateuUI;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@MateuUI("/simpleform")
@Getter@Setter
public class SimpleForm {

    @NotBlank
    String name = "Mateu";

    int age;

    String street;

    @MainAction(target = ActionTarget.Message)
    String sayHello() {
        return "Hello " + name;
    }

    @MainAction(type = ActionType.Secondary, target = ActionTarget.Message)
    String sayGoodbye() {
        return "Bye " + name;
    }

}
