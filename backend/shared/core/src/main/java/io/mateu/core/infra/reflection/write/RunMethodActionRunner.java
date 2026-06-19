package io.mateu.core.infra.reflection.write;

import static io.mateu.core.domain.act.DefaultActionRunnerProvider.asFlux;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.MethodProvider.getMethod;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.application.runaction.ComponentStateHelper;
import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.act.ActionRunner;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.lang.reflect.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Named
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class RunMethodActionRunner implements ActionRunner {

  private final InstanceFactoryProvider instanceFactoryProvider;

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return actionId.startsWith("nested-form-action-")
        || (getMethod(instance.getClass(), actionId) != null
            || getFieldByName(instance.getClass(), actionId) != null);
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var methodName = command.actionId();
    if (command.actionId().startsWith("nested-form-action-")) {
      var fieldAndMethod = command.actionId().substring("nested-form-action-".length());
      var fieldId = fieldAndMethod.substring(0, fieldAndMethod.indexOf('-'));
      methodName = fieldAndMethod.substring(fieldId.length() + 1);
      var field = getFieldByName(instance.getClass(), fieldId);
      if (field != null) {
        if (!field.canAccess(instance)) field.setAccessible(true);
        Object nestedForm = getValue(field, instance);
        if (nestedForm == null) {
          nestedForm = getValueOrNewInstance(field, instance, command.httpRequest());
        }
        instance = nestedForm;
      }
    }
    Method m = getMethod(instance.getClass(), methodName);
    if (m != null) {
      if (!m.canAccess(instance)) m.setAccessible(true);
      Object result = invoke(m, instance, command);
      if (result == null) {
        var state = ComponentStateHelper.getState(instance, command.httpRequest());
        return Flux.just(
            new UIFragmentDto(
                command.initiatorComponentId(),
                null,
                state,
                null,
                UIFragmentActionDto.Replace,
                null));
      }
      return asFlux(result, instance);
    }
    Field f = getFieldByName(instance.getClass(), methodName);
    if (f != null) {
      if (!f.canAccess(instance)) f.setAccessible(true);
      Object result = getValue(f, instance);
      if (result == null) {
        result =
            instanceFactoryProvider
                .get(f.getType().getName())
                .createInstance(f.getType().getName(), Map.of(), command.httpRequest());
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

  public static Object invoke(Method m, Object instance, RunActionCommand command)
      throws InvocationTargetException, IllegalAccessException {
    if (m.getParameterCount() > 0) {
      return m.invoke(instance, createParameters(m, command));
    } else {
      return m.invoke(instance);
    }
  }

  public static Object[] createParameters(Method m, RunActionCommand command) {
    List<Object> params = new ArrayList<>();
    for (Parameter p : m.getParameters()) {
      if (List.class.isAssignableFrom(p.getType())) {
        var type = getGenericClass(p.getParameterizedType());
        params.add(command.httpRequest().getSelectedRows(type));
      } else if (HttpRequest.class.equals(p.getType())) {
        params.add(command.httpRequest());
      } else {
        try {
          params.add(command.httpRequest().getClickedRow(p.getType()));
        } catch (Exception ignored) {
          params.add(null); // tipo no reconocido → null para no desalinear el array
        }
      }
    }
    return params.toArray();
  }
}
