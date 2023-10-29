package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.editors.EntityEditor;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.util.Helper;
import java.util.Map;

import io.mateu.util.Serializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class EntityEditorEditActionRunner implements ActionRunner {

  @Autowired JourneyStoreService store;
  @Autowired
  Serializer serializer;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof EntityEditor && "edit".equals(actionId);
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
    store.setStep(journeyId, "edit", getEditor((EntityEditor) viewInstance), serverHttpRequest);
    return Mono.empty();
  }

  private Object getEditor(EntityEditor entityEditor) throws Exception {
    Object pojo =
        serializer.fromJson(serializer.toJson(entityEditor.getData()), entityEditor.getEntityClass());
    return pojo;
  }
}
