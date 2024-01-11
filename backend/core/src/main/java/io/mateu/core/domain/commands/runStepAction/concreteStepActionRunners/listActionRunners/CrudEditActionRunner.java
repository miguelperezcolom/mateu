package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.model.editors.EntityEditorFactory;
import io.mateu.core.domain.model.editors.ObjectEditorFactory;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Serializer;
import jakarta.persistence.Entity;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class CrudEditActionRunner implements ListActionRunner {

  final JourneyStoreService store;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;

  @Override
  public boolean applies(Crud crud, String actionId) {
    return "edit".equals(actionId);
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

    Object row = data.get("_selectedRow");

    int __index = (Integer) data.getOrDefault("__index", -1);
    int __count = (Integer) data.getOrDefault("__count", -1);

    if (row == null && (__index == -1 && __count == -1)) {
      throw new Exception("No row selected");
    }

    if (row == null) {

      Object filtersDeserialized =
          new FiltersDeserializer(
                  journeyId,
                  stepId,
                  listId,
                  (Map<String, Object>) store.getLastUsedFilters(journeyId, stepId, listId),
                  serverHttpRequest,
                  reflectionHelper,
                  serializer)
              .deserialize(store);

      var ordering = store.getLastUsedOrders(journeyId, stepId, listId);
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
          reflectionHelper.newInstance(EntityEditorFactory.class).create(editor, __index, __count);
    } else {
      editor =
          reflectionHelper.newInstance(ObjectEditorFactory.class).create(editor, __index, __count);
    }

    store.setStep(journeyId, newStepId, editor, serverHttpRequest);

    return Mono.empty();
  }
}
