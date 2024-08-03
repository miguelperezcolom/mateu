package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.ReadOnlyPojo;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.dtos.JourneyContainer;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ObjectEditorEditActionRunner implements ActionRunner {

  final JourneyContainerService store;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return viewInstance instanceof ObjectEditor && "edit".equals(actionId);
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
    // store.setStep(journeyId, "edit_object", getObject((ObjectEditor) viewInstance),
    // serverHttpRequest);
    store.setStep(
        journeyContainer, "edit", getEditor((ObjectEditor) viewInstance), serverHttpRequest, ActionTarget.SameLane);
    return Mono.empty();
  }

  private Object getEditor(ObjectEditor objectEditor) throws Throwable {
    Object object = reflectionHelper.newInstance(objectEditor.getType());
    Object filled =
        serializer.fromJson(serializer.toJson(objectEditor.getData()), objectEditor.getType());
    reflectionHelper.copy(filled, object);

    Object editor = object;
    if (object instanceof ReadOnlyPojo) {
      editor = ((ReadOnlyPojo) object).retrieveEditor();
    }
    return editor;
  }
}
