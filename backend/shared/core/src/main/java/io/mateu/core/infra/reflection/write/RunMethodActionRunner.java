package io.mateu.core.infra.reflection.write;

import static io.mateu.core.domain.act.DefaultActionRunnerProvider.asFlux;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.MethodProvider.getMethod;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.act.ActionRunner;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.core.infra.reflection.read.MethodProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.lang.reflect.*;
import java.util.Map;
import java.util.concurrent.Callable;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Named
@RequiredArgsConstructor
public class RunMethodActionRunner implements ActionRunner {

  private final InstanceFactoryProvider instanceFactoryProvider;

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return getMethod(instance.getClass(), actionId) != null || getFieldByName(instance.getClass(), actionId) != null;
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    Method m = getMethod(instance.getClass(), command.actionId());
    if (m != null) {
      if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);
      Object result = m.invoke(instance);
      return asFlux(result, instance);
    }
    Field f = getFieldByName(instance.getClass(), command.actionId());
    if (f != null) {
      if (!Modifier.isPublic(f.getModifiers())) f.setAccessible(true);
      Object result = getValue(f, instance);
      if (result == null) {
        result = instanceFactoryProvider.get(f.getType().getName()).createInstance(f.getType().getName(), Map.of(), command.httpRequest());
      }
      if (result instanceof Callable<?> callable) {
        result = callable.call();
      }
      if (result instanceof Runnable runnable) {
        runnable.run();
        result = null;
      }
      if (result instanceof Mono mono) {
        return mono.flux();
      }
      if (result instanceof Flux<?> flux) {
        return flux;
      }
      return asFlux(result, instance);
    }
    return Flux.empty();
  }
}
