package io.mateu.core.domain.commands.runStepAction;

import com.google.common.base.Strings;
import io.mateu.core.domain.model.editors.EntityEditor;
import io.mateu.core.domain.model.editors.FieldEditor;
import io.mateu.core.domain.model.editors.ObjectEditor;
import io.mateu.core.domain.model.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Form;
import java.time.LocalDateTime;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class RunStepActionCommandHandler {

  final JourneyStoreService store;
  final List<ActionRunner> actionRunners;
  final ActualValueExtractor actualValueExtractor;
  final ReflectionHelper reflectionHelper;
  final ViewMapper viewMapper;

  @Transactional
  public Mono<Void> handle(RunStepActionCommand command) throws Throwable {
    String journeyId = command.getJourneyId();
    String stepId = command.getStepId();
    String actionId = command.getActionId();
    Map<String, Object> data = command.getData();
    if (data == null) {
      data = new HashMap<>();
    }
    ServerHttpRequest serverHttpRequest = command.getServerHttpRequest();

    data = nestPartialFormData(data);

    JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);

    if (journeyContainer == null) {
      throw new Exception("No journey with id " + journeyId);
    }

    if ("xxxbacktostep".equals(actionId)) {
      journeyContainer.getJourney().setCurrentStepId(stepId);
      journeyContainer.getJourney().setCurrentStepDefinitionId("xxx");
      journeyContainer.setLastAccess(LocalDateTime.now());
      store.save(journeyContainer);
      resetMessages(journeyId);

      return Mono.empty().then();
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
                  reflectionHelper.setValue(entry.getKey(), viewInstance, actualValue);
                } catch (Exception ex) {
                  System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                }
              });
    }

    var step = store.readStep(journeyId, stepId);
    step.mergeData(data);
    viewMapper.unnestPartialFormData(step.getData(), viewInstance);
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
        return actionRunner
            .run(viewInstance, journeyId, stepId, actionId, data, serverHttpRequest)
            .then(
                Mono.deferContextual(
                    contextView -> {
                      String activeTabId = (String) command.getData().get("__activeTabId");
                      try {
                        var stepAfterRun = store.readStep(journeyId, stepId);
                        stepAfterRun.getView().getMain().getComponents().stream()
                            .map(c -> c.getMetadata())
                            .filter(m -> m instanceof Form)
                            .map(m -> (Form) m)
                            .flatMap(f -> f.getTabs().stream())
                            .forEach(
                                t ->
                                    t.setActive(
                                        !Strings.isNullOrEmpty(activeTabId)
                                            && activeTabId.equals(t.getId())));
                        store.updateStep(journeyId, stepId, stepAfterRun);
                      } catch (Throwable e) {
                        throw new RuntimeException(e);
                      }

                      return Mono.empty();
                    }));
      }
    }

    throw new Exception("Unknown action " + actionId);
  }

  private void resetMessages(String journeyId) {
    var journeyContainer = store.findJourneyById(journeyId).get();
    var currentStepId = journeyContainer.getJourney().getCurrentStepId();
    var step = journeyContainer.getSteps().get(currentStepId);
    step.getView().setMessages(List.of());
    store.save(journeyContainer);
  }

  private Map<String, Object> nestPartialFormData(Map<String, Object> data) {
    var nestedData = new HashMap<String, Object>();

    // first we copy all the data which is not nested
    data.keySet().stream()
        .filter(k -> !k.startsWith("__nestedData__"))
        .forEach(
            k -> {
              nestedData.put(k, data.get(k));
            });

    // then we copy all the unnested data nesting it back
    data.keySet().stream()
        .filter(k -> k.startsWith("__nestedData__"))
        .forEach(
            k -> {
              // __nes 0 tedData__company 1 Information__compan 2 yName
              var tokens = k.split("__");
              if (tokens.length >= 4) {
                var sectionId = tokens[2];
                var fieldId = tokens[3];
                if (!Strings.isNullOrEmpty(sectionId) && !Strings.isNullOrEmpty(fieldId)) {
                  Map<String, Object> nestedMap = (Map<String, Object>) nestedData.get(sectionId);
                  if (nestedMap == null) {
                    nestedMap = new HashMap<>();
                    nestedData.put(sectionId, nestedMap);
                  }
                  nestedMap.put(fieldId, data.get(k));
                }
              }
            });

    return nestedData;
  }
}
