package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.RunMethodActionRunner;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.core.interfaces.HasActions;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.interfaces.SelectedRowsContext;
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
  public boolean applies(JourneyContainer journeyContainer, Crud crud, String actionId) {
    List<Method> allMethods =
        reflectionHelper.getAllMethods(crud.getClass()).stream()
            .filter(m -> m.isAnnotationPresent(Action.class))
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
      JourneyContainer journeyContainer,
      Crud crud,
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
              .filter(m -> m.isAnnotationPresent(Action.class))
              .collect(Collectors.toList());
      if (crud instanceof HasActions) {
        allMethods.addAll(((HasActions) crud).getActionMethods());
      }

      Method method = allMethods.stream().filter(m -> actionId.equals(m.getName())).findAny().get();

      runMethodActionRunner.runMethod(
          journeyContainer,
          getInstance(crud, method),
          method,
          stepId,
          actionId,
          data,
          serverHttpRequest);

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
