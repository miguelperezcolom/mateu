package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.dtos.JourneyContainer;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class EntityEditorEditActionRunner implements ActionRunner {

  @Autowired JourneyContainerService store;
  @Autowired Serializer serializer;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return viewInstance instanceof EntityEditor && "edit".equals(actionId);
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
    store.setStep(
        journeyContainer, "edit", getEditor((EntityEditor) viewInstance), serverHttpRequest);
    return Mono.empty();
  }

  private Object getEditor(EntityEditor entityEditor) throws Exception {
    Object pojo =
        serializer.fromJson(
            serializer.toJson(entityEditor.getData()), entityEditor.getEntityClass());
    return pojo;
  }
}
