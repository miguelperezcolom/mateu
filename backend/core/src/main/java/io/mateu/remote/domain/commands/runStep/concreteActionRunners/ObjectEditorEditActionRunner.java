package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.ObjectEditor;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.util.Helper;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class ObjectEditorEditActionRunner implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof ObjectEditor && "edit".equals(actionId);
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
    // store.setStep(journeyId, "edit_object", getObject((ObjectEditor) viewInstance),
    // serverHttpRequest);
    store.setStep(journeyId, "edit", getEditor((ObjectEditor) viewInstance), serverHttpRequest);
  }

  private Object getEditor(ObjectEditor objectEditor) throws Throwable {
    Object object = ReflectionHelper.newInstance(objectEditor.getType());
    Object filled = Helper.fromJson(Helper.toJson(objectEditor.getData()), objectEditor.getType());
    ReflectionHelper.copy(filled, object);

    Object editor = object;
    if (object instanceof ReadOnlyPojo) {
      editor = ((ReadOnlyPojo) object).retrieveEditor();
    }
    return editor;
  }
}
