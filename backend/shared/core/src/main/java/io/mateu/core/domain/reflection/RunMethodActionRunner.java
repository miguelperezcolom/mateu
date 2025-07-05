package io.mateu.core.domain.reflection;

import io.mateu.core.domain.ActionRunner;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.lang.reflect.*;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;

@Named
public class RunMethodActionRunner implements ActionRunner {

  private final MethodProvider methodProvider = new MethodProvider();

  @Override
  public boolean supports(Object instance, String actionId) {
    return methodProvider.getMethod(instance.getClass(), actionId) != null;
  }

  @SneakyThrows
  @Override
  public Mono<?> run(
      Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest) {
    Method m = methodProvider.getMethod(instance.getClass(), actionId);
    if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);
    Object result = m.invoke(instance);
    if (result instanceof Mono<?> mono) {
      return mono;
    }
    if (result == null) {
      return Mono.just(instance);
    }
    return Mono.just(result);
  }
}
