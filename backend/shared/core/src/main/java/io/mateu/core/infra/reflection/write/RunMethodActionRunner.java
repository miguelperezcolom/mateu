package io.mateu.core.infra.reflection.write;

import static io.mateu.core.domain.act.DefaultActionRunnerProvider.asFlux;
import static io.mateu.core.infra.reflection.read.MethodProvider.getMethod;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.act.ActionRunner;
import io.mateu.core.infra.reflection.read.MethodProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.lang.reflect.*;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

@Named
public class RunMethodActionRunner implements ActionRunner {

  private final MethodProvider methodProvider = new MethodProvider();

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return getMethod(instance.getClass(), actionId) != null;
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    Method m = getMethod(instance.getClass(), command.actionId());
    if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);
    Object result = m.invoke(instance);
    return asFlux(result, instance);
  }
}
