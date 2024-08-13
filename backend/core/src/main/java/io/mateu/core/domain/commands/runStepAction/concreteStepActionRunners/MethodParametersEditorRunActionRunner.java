package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.Step;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class MethodParametersEditorRunActionRunner extends AbstractActionRunner
    implements ActionRunner {

  final JourneyContainerService store;
  private final ActualValueExtractor actualValueExtractor;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return viewInstance instanceof MethodParametersEditor && "run".equals(actionId);
  }

  @Override
  public Mono<JourneyContainer> run(
      JourneyContainer journeyContainer,
      Object viewInstance,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    MethodParametersEditor methodParametersEditor = (MethodParametersEditor) viewInstance;

    Step initialStep = store.readStep(journeyContainer, methodParametersEditor.getInitialStep());

    Method m =
        reflectionHelper.getMethod(
            methodParametersEditor.getType(), methodParametersEditor.getMethodId());

    if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);

    Object object =
        Modifier.isStatic(m.getModifiers())
            ? null
            : serializer.fromMap(
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
      journeyContainer =
          store.updateStep(journeyContainer, initialStep.id(), object, serverHttpRequest);
    }

    Object whatToShow = result;
    if (!void.class.equals(m.getReturnType())) {
      if (whatToShow instanceof Result) {
        whatToShow =
            addBackDestination((Result) whatToShow, store.getInitialStep(journeyContainer));
      }
      String newStepId = "result_" + UUID.randomUUID().toString();
      journeyContainer = store.setStep(journeyContainer, newStepId, whatToShow, serverHttpRequest);
    } else {
      journeyContainer = store.backToStep(journeyContainer, initialStep.id()); // will save the step
    }

    return Mono.just(journeyContainer);
  }
}
