package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.MethodParametersEditor;
import io.mateu.remote.domain.store.JourneyStoreService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class MethodParametersEditorCancelActionRunner implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof MethodParametersEditor && "cancel".equals(actionId);
  }

  @Override
  public void run(
      Object viewInstance,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    MethodParametersEditor methodParametersEditor = (MethodParametersEditor) viewInstance;
    store.backToStep(journeyId, methodParametersEditor.getInitialStep());
  }
}
