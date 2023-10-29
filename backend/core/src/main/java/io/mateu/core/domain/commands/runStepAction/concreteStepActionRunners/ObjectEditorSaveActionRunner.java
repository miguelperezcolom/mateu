package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.editors.ObjectEditor;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.shared.data.Destination;
import io.mateu.mdd.shared.data.DestinationType;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import io.mateu.util.Serializer;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ObjectEditorSaveActionRunner implements ActionRunner {

  final JourneyStoreService store;
  final ActualValueExtractor actualValueExtractor;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof ObjectEditor && "save".equals(actionId);
  }

  @Override
  public Mono<Void> run(
      Object viewInstance,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    ObjectEditor objectEditor = (ObjectEditor) viewInstance;

    Object pojo = getActualInstance(objectEditor, data);
    if (pojo instanceof PersistentPojo) {
      ((PersistentPojo<?>) pojo).save();
    }

    data.remove("__entityClassName__");
    objectEditor.setData(data);
    store.setStep(journeyId, stepId, objectEditor, serverHttpRequest);

    Step initialStep = store.getInitialStep(journeyId);

    Result whatToShow =
        new Result(
            ResultType.Success,
            "" + viewInstance.toString() + " has been saved",
            List.of(),
            new Destination(
                DestinationType.ActionId, "Back to " + initialStep.getName(), initialStep.getId()));
    String newStepId = "result_" + UUID.randomUUID().toString();
    store.setStep(journeyId, newStepId, whatToShow, serverHttpRequest);

    return Mono.empty();
  }

  private Object getActualInstance(ObjectEditor objectEditor, Map<String, Object> data) {
    try {
      Object object = reflectionHelper.newInstance(objectEditor.getType());
      Object filled =
          serializer.fromJson(serializer.toJson(objectEditor.getData()), objectEditor.getType());
      reflectionHelper.copy(filled, object);
      var actualInstance = object;
      data.entrySet()
          .forEach(
              entry -> {
                try {
                  Object actualValue = actualValueExtractor.getActualValue(entry, actualInstance);
                  reflectionHelper.setValue(entry.getKey(), actualInstance, actualValue);
                } catch (Exception ex) {
                  System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                }
              });
      return actualInstance;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }
}
