package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.application.security.ActionMethods;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

final class CrudViewMethodInvoker {

  static Object invoke(String methodName, Object item, Crud orchestrator, HttpRequest httpRequest) {
    for (Object subject : java.util.Arrays.asList(item, orchestrator.behaviourSource())) {
      if (subject == null) {
        continue;
      }
      for (Method method : getAllMethods(subject.getClass())) {
        if (methodName.equals(method.getName())) {
          if (!ActionMethods.isInvocable(method, subject, httpRequest)) {
            continue;
          }
          ActionMethods.checkAccess(method, subject.getClass(), httpRequest);
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
    for (Object subject : java.util.Arrays.asList(item, orchestrator.behaviourSource())) {
      if (subject != null
          && getAllMethods(subject.getClass()).stream()
              .anyMatch(method -> methodName.equals(method.getName()))) {
        throw ActionMethods.notAnAction(subject.getClass(), methodName);
      }
    }
    // no method of that name on the record or the crud: an id no handler claims (a button renamed
    // since the tab was opened) is refused like any other unknown action, not answered as if the
    // method had returned nothing
    throw ActionMethods.noSuchAction(
        orchestrator.behaviourSource() != null
            ? orchestrator.behaviourSource().getClass()
            : orchestrator.getClass(),
        "action-on-view-" + methodName);
  }

  private CrudViewMethodInvoker() {}
}
