package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.editors.ObjectEditor;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.interfaces.ReadOnlyPojo;
import io.mateu.core.domain.util.Serializer;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ObjectEditorEditActionRunner implements ActionRunner {

  final JourneyStoreService store;
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
        journeyContainer, "edit", getEditor((ObjectEditor) viewInstance), serverHttpRequest);
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
