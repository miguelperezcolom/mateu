package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

final class CrudViewMethodInvoker {

  static Object invoke(String methodName, Object item, Crud orchestrator, HttpRequest httpRequest) {
    for (Object subject : List.of(item, orchestrator.behaviourSource())) {
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
          } catch (InvocationTargetException e) {
            // surface the user view-method's REAL cause, not the reflective wrapper / lombok mask
            var cause = e.getCause() != null ? e.getCause() : e;
            if (cause instanceof RuntimeException re) {
              throw re;
            }
            if (cause instanceof Error err) {
              throw err;
            }
            throw new RuntimeException(cause);
          } catch (IllegalAccessException e) {
            throw new RuntimeException("Cannot invoke " + method, e);
          }
        }
      }
    }
    return null;
  }

  private CrudViewMethodInvoker() {}
}
