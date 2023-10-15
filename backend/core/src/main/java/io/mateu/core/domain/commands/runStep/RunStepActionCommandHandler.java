package io.mateu.core.domain.commands.runStep;

import com.google.common.base.Strings;
import io.mateu.core.domain.apiClients.MateuRemoteClient;
import io.mateu.core.domain.model.editors.EntityEditor;
import io.mateu.core.domain.model.editors.FieldEditor;
import io.mateu.core.domain.model.editors.ObjectEditor;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.reflection.ReflectionHelper;
import java.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class RunStepActionCommandHandler {

  @Autowired JourneyStoreService store;

  @Autowired MateuRemoteClient mateuRemoteClient;

  @Autowired List<ActionRunner> actionRunners;

  @Autowired ActualValueExtractor actualValueExtractor;

  @Transactional
  public Mono<Void> handle(RunStepActionCommand command) throws Throwable {

    String journeyId = command.getJourneyId();
    String stepId = command.getStepId();
    String actionId = command.getActionId();
    Map<String, Object> data = command.getData();
    ServerHttpRequest serverHttpRequest = command.getServerHttpRequest();

    JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);

    if (journeyContainer == null) {
      throw new Exception("No journey with id " + journeyId);
    }

    if (!Strings.isNullOrEmpty(journeyContainer.getRemoteJourneyTypeId())) {
      return mateuRemoteClient.runStep(
          journeyContainer.getRemoteBaseUrl(),
          journeyContainer.getRemoteJourneyTypeId(),
          journeyContainer.getJourneyId(),
          stepId,
          actionId,
          data,
          serverHttpRequest);
    }

    Object viewInstance = store.getViewInstance(journeyId, stepId, serverHttpRequest);

    if (viewInstance instanceof FieldEditor) {
      // no need to fill the fieldEditor
    } else if (viewInstance instanceof ObjectEditor) {
      // no need to fill the entityEditor
    } else if (viewInstance instanceof EntityEditor) {
      // no need to fill the entityEditor
    } else {
      data.entrySet()
          .forEach(
              entry -> {
                try {
                  Object actualValue = actualValueExtractor.getActualValue(entry, viewInstance);
                  ReflectionHelper.setValue(entry.getKey(), viewInstance, actualValue);
                } catch (Exception ex) {
                  System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                }
              });
    }

    var step = store.getStep(journeyId, stepId);
    step.mergeData(data);
    store.updateStep(journeyId, stepId, step);

    // todo: look for the target object
    String componentId = "component-0";
    if (actionId.contains("___")) {
      componentId = actionId.substring(0, actionId.indexOf("___"));
      actionId = actionId.substring(actionId.indexOf("___") + "___".length());
    }

    if (!"component-0".equals(componentId)) {}

    for (ActionRunner actionRunner : actionRunners) {
      if (actionRunner.applies(viewInstance, actionId)) {
        return actionRunner.run(viewInstance, journeyId, stepId, actionId, data, serverHttpRequest);
      }
    }

    throw new Exception("Unkonwn action " + actionId);
  }
}
