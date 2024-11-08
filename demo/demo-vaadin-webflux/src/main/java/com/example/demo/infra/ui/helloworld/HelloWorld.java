package com.example.demo.infra.ui.helloworld;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.ActionTarget;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.RawContent;
import io.mateu.uidl.interfaces.ConsumesContextData;
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
