package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.store.JourneyContainerService;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.PersistentPojo;
import io.mateu.core.domain.uidefinition.shared.data.Destination;
import io.mateu.core.domain.uidefinition.shared.data.DestinationType;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.ResultType;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.Step;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ObjectEditorSaveActionRunner implements ActionRunner {

  final JourneyContainerService store;
  final ActualValueExtractor actualValueExtractor;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;
  final ValidationService validationService;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return viewInstance instanceof ObjectEditor && "save".equals(actionId);
  }

  @Override
  public Mono<Void> run(
      JourneyContainer journeyContainer,
      Object viewInstance,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    ObjectEditor objectEditor = (ObjectEditor) viewInstance;

    Object pojo = getActualInstance(objectEditor, data);

    validationService.validate(pojo);

    if (pojo instanceof PersistentPojo) {
      ((PersistentPojo<?>) pojo).save();
    }

    data.remove("__entityClassName__");
    objectEditor.setData(data);
    store.setStep(journeyContainer, stepId, objectEditor, serverHttpRequest);

    Step initialStep = store.getInitialStep(journeyContainer);

    Result whatToShow =
        new Result(
            ResultType.Success,
            "" + viewInstance.toString() + " has been saved",
            List.of(),
            new Destination(
                DestinationType.ActionId, "Back to " + initialStep.getName(), initialStep.getId()),
            null);
    String newStepId = "result_" + UUID.randomUUID().toString();
    store.setStep(journeyContainer, newStepId, whatToShow, serverHttpRequest);

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
