package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import lombok.SneakyThrows;

final class CrudViewMethodInvoker {

  @SneakyThrows
  static Object invoke(String methodName, Object item, Crud orchestrator, HttpRequest httpRequest) {
    for (Object subject : List.of(item, orchestrator)) {
      for (Method method : getAllMethods(subject.getClass())) {
        if (methodName.equals(method.getName())) {
          method.setAccessible(true);
          List<Object> args = new ArrayList<>();
          for (int i = 0; i < method.getParameterCount(); i++) {
            if (item != null && method.getParameterTypes()[i].isAssignableFrom(item.getClass())) {
              args.add(item);
            }
            if (method.getParameterTypes()[i].isAssignableFrom(orchestrator.getClass())) {
              args.add(orchestrator);
            }
            if (method.getParameterTypes()[i].isAssignableFrom(httpRequest.getClass())) {
              args.add(httpRequest);
            }
          }
          try {
            return method.invoke(subject, args.toArray());
          } catch (Throwable e) {
            if (e instanceof InvocationTargetException invocationTargetException
                && invocationTargetException.getCause() != null) {
              throw invocationTargetException.getCause();
            }
            throw e;
          }
        }
      }
    }
    return null;
  }

  private CrudViewMethodInvoker() {}
}
