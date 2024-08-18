package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.inbound.editors.EntityEditorFactory;
import io.mateu.core.domain.model.inbound.editors.ObjectEditorFactory;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.core.interfaces.PersistentPojo;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.Step;
import jakarta.persistence.Entity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class CrudEditActionRunner implements ListActionRunner {

  final JourneyContainerService store;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Crud crud, String actionId) {
    return "edit".equals(actionId);
  }

  @Override
  public Mono<JourneyContainer> run(
      JourneyContainer journeyContainer,
      Crud crud,
      String stepId,
      String listId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    Object row = data.get("_selectedRow");

    int __index = (Integer) data.getOrDefault("__index", -1);
    int __count = (Integer) data.getOrDefault("__count", -1);

    var newData = new HashMap<>(journeyContainer.steps().get(stepId).data());
    newData.put("__listId", listId);

    var steps = new HashMap<>(journeyContainer.steps());
    var step = journeyContainer.steps().get(stepId);

    steps.put(
            stepId,
            new Step(
                    step.id(),
                    step.name(),
                    step.type(),
                    step.view(),
                    newData,
                    step.rules(),
                    step.previousStepId(),
                    step.target()));

    journeyContainer = new JourneyContainer(
            journeyContainer.journeyId(),
            journeyContainer.journeyTypeId(),
            journeyContainer.remoteBaseUrl(),
            journeyContainer.journeyClass(),
            journeyContainer.journeyData(),
            journeyContainer.journey(),
            journeyContainer.steps(),
            journeyContainer.stepHistory(),
            journeyContainer.initialStep(),
            journeyContainer.lastUsedFilters(),
            journeyContainer.lastUsedSorting(),
            journeyContainer.modalMustBeClosed());

    if (row == null && (__index == -1 && __count == -1)) {
      throw new Exception("No row selected");
    }

    if (row == null) {

      Object filtersDeserialized =
          new FiltersDeserializer(
                  journeyContainer,
                  stepId,
                  listId,
                  getAsMap(store.getLastUsedFilters(journeyContainer, stepId, listId)),
                  serverHttpRequest,
                  reflectionHelper,
                  serializer)
              .deserialize(store);

      var ordering = store.getLastUsedOrders(journeyContainer, stepId, listId);
      // new OrderingDeserializer(store.getLastUsedOrders(journeyId, stepId,
      // listId)).deserialize(serializer);

      row =
          crud.fetchRows(filtersDeserialized, ordering, (Integer) __index, 1)
              .next()
              .toFuture()
              .get();
    }

    Object editor = null;
    try {
      if (row instanceof Map) {
        row = crud.getRow((Map<String, Object>) row, serializer);
      }
      editor = crud.getDetail(row);
    } catch (Throwable e) {
      throw new Exception(
          "Crud onEdit thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
    }

    if (editor == null) {
      throw new Exception("Crud onEdit returned null");
    }

    String newStepId = "view";
    if (editor instanceof PersistentPojo) {
      newStepId = "edit";
    }

    if (editor.getClass().isAnnotationPresent(Entity.class)) {
      editor =
          reflectionHelper.newInstance(EntityEditorFactory.class).create(editor, __index, __count, listId);
    } else {
      editor =
          reflectionHelper.newInstance(ObjectEditorFactory.class).create(editor, __index, __count, listId);
    }

    journeyContainer = store.setStep(journeyContainer, newStepId, editor, serverHttpRequest);

    return Mono.just(journeyContainer);
  }

  @SneakyThrows
  private Map<String, Object> getAsMap(Object object) {
    if (object == null) {
      return null;
    }
    if (object instanceof Map) {
      return (Map<String, Object>) object;
    }
    return serializer.toMap(object);
  }
}
