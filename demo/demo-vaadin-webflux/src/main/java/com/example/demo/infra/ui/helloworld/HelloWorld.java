package com.example.demo.infra.ui.helloworld;

import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.ConsumesContextData;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MateuUI;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.RawContent;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.Map;

@MateuUI("/helloworld")
public class HelloWorld implements ConsumesContextData {

    @NotBlank
    String name = "Mateu";

    int age = 16;

    @RawContent
    String dataFromContext;

    @MainAction(target = ActionTarget.Message)
    String sayHello() {
        return "Hello " + name + " " + age + "!";
    }

    @Override
    public void consume(Map<String, Object> context, ServerHttpRequest serverHttpRequest) {
        dataFromContext = "context data: " + context.toString();
    }
}
