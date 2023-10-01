package io.mateu.core.domain.commands.runStep.concreteActionRunners;

import io.mateu.core.domain.commands.runStep.ActionRunner;
import io.mateu.core.domain.editors.FieldEditor;
import io.mateu.core.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class FieldEditorSaveActionRunner implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof FieldEditor && "save".equals(actionId);
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
    FieldEditor fieldEditor = (FieldEditor) viewInstance;

    Step initialStep = store.getStep(journeyId, fieldEditor.getInitialStep());

    Object object = Helper.fromJson(Helper.toJson(data), fieldEditor.getType());
    data = Serializer.toMap(object);
    data.put("__toString", "" + object);

    initialStep.getData().put(fieldEditor.getFieldId(), data);

    store.backToStep(journeyId, initialStep.getId()); // will save the step
  }
}
