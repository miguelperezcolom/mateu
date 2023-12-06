package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.RunMethodActionRunner;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.core.interfaces.HasActions;
import io.mateu.mdd.shared.interfaces.SelectedRowsContext;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Serializer;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class CrudMethodActionRunner implements ListActionRunner {

  final ReflectionHelper reflectionHelper;
  final RunMethodActionRunner runMethodActionRunner;
  final Serializer serializer;

  @Override
  public boolean applies(Crud crud, String actionId) {
    List<Method> allMethods =
        reflectionHelper.getAllMethods(crud.getClass()).stream()
            .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class))
            .collect(Collectors.toList());
    if (crud instanceof HasActions) {
      allMethods.addAll(((HasActions) crud).getActionMethods());
    }
    return allMethods.stream()
        .map(m -> m.getName())
        .collect(Collectors.toList())
        .contains(actionId);
  }

  @Override
  public Mono<Void> run(
      Crud crud,
      String journeyId,
      String stepId,
      String listId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    List selectedRows = (List) data.get("_selectedRows");
    List<Object> targetSet =
        new ArrayList<>(
            (Collection)
                selectedRows.stream()
                    .map(
                        m -> {
                          try {
                            return crud.getRow((Map<String, Object>) m, serializer);
                          } catch (Throwable e) {
                            e.printStackTrace();
                          }
                          return null;
                        })
                    .collect(Collectors.toList()));

    new SelectedRowsContext(targetSet);

    try {

      List<Method> allMethods =
          reflectionHelper.getAllMethods(crud.getClass()).stream()
              .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class))
              .collect(Collectors.toList());
      if (crud instanceof HasActions) {
        allMethods.addAll(((HasActions) crud).getActionMethods());
      }

      Method method = allMethods.stream().filter(m -> actionId.equals(m.getName())).findAny().get();

      runMethodActionRunner.runMethod(
          getInstance(crud, method), method, journeyId, stepId, actionId, data, serverHttpRequest);

    } catch (Throwable e) {
      throw new Exception(
          "Crud " + actionId + " thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
    }

    return Mono.empty();
  }

  private Object getInstance(Crud crud, Method method) {
    if (Modifier.isStatic(method.getModifiers())) {
      return null;
    }
    return crud;
  }
}
