package com.example.demo.infra.ui;

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

    @MainAction
    String sayHello() {
        return "Hello " + name;
    }

}
