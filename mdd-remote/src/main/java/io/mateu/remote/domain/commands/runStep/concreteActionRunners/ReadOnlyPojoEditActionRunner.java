package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.store.JourneyStoreService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class ReadOnlyPojoEditActionRunner implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof ReadOnlyPojo && "edit".equals(actionId);
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
    Object editor = ((ReadOnlyPojo) viewInstance).retrieveEditor();

    if (editor == null) {
      throw new Exception(
          "getEditor returned null for the ReadOnlyPojo "
              + viewInstance.getClass().getSimpleName());
    }

    store.setStep(journeyId, "edit", editor, serverHttpRequest);
  }
}
