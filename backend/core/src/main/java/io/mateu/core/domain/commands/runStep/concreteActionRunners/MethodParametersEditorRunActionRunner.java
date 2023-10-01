package io.mateu.core.domain.commands.runStep.concreteActionRunners;

import io.mateu.core.domain.commands.runStep.ActionRunner;
import io.mateu.core.domain.commands.runStep.ActualValueExtractor;
import io.mateu.core.domain.model.editors.MethodParametersEditor;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.shared.data.Result;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Serializer;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class MethodParametersEditorRunActionRunner extends AbstractActionRunner
    implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Autowired private ActualValueExtractor actualValueExtractor;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof MethodParametersEditor && "run".equals(actionId);
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

    Step initialStep = store.getStep(journeyId, methodParametersEditor.getInitialStep());

    Method m =
        ReflectionHelper.getMethod(
            methodParametersEditor.getType(), methodParametersEditor.getMethodId());

    Object object =
        Modifier.isStatic(m.getModifiers())
            ? null
            : Serializer.fromMap(
                methodParametersEditor.getData(), methodParametersEditor.getType());

    List<Object> values = new ArrayList<>();
    for (int i = 0; i < m.getParameterCount(); i++) {
      if (ServerHttpRequest.class.equals(m.getParameterTypes()[i])) {
        values.add(serverHttpRequest);
        continue;
      }
      values.add(
          actualValueExtractor.getActualValue(m.getParameterTypes()[i], data.get("param_" + i)));
    }
    Object result = m.invoke(object, values.toArray());

    if (object != null) {
      store.updateStep(journeyId, initialStep.getId(), object, serverHttpRequest);
    }

    Object whatToShow = result;
    if (!void.class.equals(m.getReturnType())) {
      if (whatToShow instanceof Result) {
        addBackDestination((Result) whatToShow, store.getInitialStep(journeyId));
      }
      String newStepId = "result_" + UUID.randomUUID().toString();
      store.setStep(journeyId, newStepId, whatToShow, serverHttpRequest);
    } else {
      store.backToStep(journeyId, initialStep.getId()); // will save the step
    }
  }
}
