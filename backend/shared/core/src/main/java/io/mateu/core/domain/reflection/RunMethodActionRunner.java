package io.mateu.core.domain.reflection;

import io.mateu.core.domain.ActionRunner;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.lang.reflect.*;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Named
public class RunMethodActionRunner implements ActionRunner {

  private final MethodProvider methodProvider = new MethodProvider();

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return methodProvider.getMethod(instance.getClass(), actionId) != null;
  }

  @SneakyThrows
  @Override
  public Flux<?> run(
      Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest) {
    Method m = methodProvider.getMethod(instance.getClass(), actionId);
    if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);
    Object result = m.invoke(instance);
    if (result instanceof Flux<?> flux) {
      return flux;
    }
    if (result instanceof Mono<?> mono) {
      return mono.flux();
    }
    if (result == null) {
      return Flux.just(instance);
    }
    return Flux.just(result);
  }
}
