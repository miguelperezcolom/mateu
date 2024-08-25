package io.mateu.core.domain.commands.runStepAction;

import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.inbound.services.ViewInstanceProvider;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.data.Pair;
import io.mateu.dtos.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class RunStepActionCommandHandler {

  final List<ActionRunner> actionRunners;
  final ActualValueExtractor actualValueExtractor;
  final ReflectionHelper reflectionHelper;
  final ViewMapper viewMapper;
  final ViewInstanceProvider viewInstanceProvider;

  @Transactional
  public Mono<JourneyContainer> handle(RunStepActionCommand command) throws Throwable {
    String stepId = command.stepId();
    String componentId = command.componentId();
    String actionId = command.actionId();
    Map<String, Object> data = command.data();
    JourneyContainer journeyContainer = command.journeyContainer();
    ServerHttpRequest serverHttpRequest = command.serverHttpRequest();

    if ("xxxbacktostep".equals(actionId)) {
      return handleBackToStep(journeyContainer, stepId);
    }

    Object viewInstance = getViewInstance(journeyContainer, stepId, componentId, serverHttpRequest);

    fillViewInstanceWithData(viewInstance, data);

    var step = journeyContainer.steps().get(stepId);
    step =
        new Step(
            step.id(),
            step.name(),
            step.type(),
            step.view(),
            step.previousStepId(),
            step.target(),
            step.components());
    var steps = new HashMap<>(journeyContainer.steps());
    steps.put(stepId, step);
    journeyContainer =
        new JourneyContainer(
            journeyContainer.journeyId(),
            journeyContainer.journeyTypeId(),
            journeyContainer.journey(),
            steps,
            Stream.concat(journeyContainer.stepHistory().stream(), Stream.of(stepId))
                .distinct()
                .toList(),
            journeyContainer.initialStep(),
            journeyContainer.modalMustBeClosed());

    for (ActionRunner actionRunner : actionRunners) {
      if (actionRunner.applies(journeyContainer, viewInstance, actionId)) {
        return actionRunner
            .run(
                journeyContainer,
                viewInstance,
                stepId,
                componentId,
                actionId,
                data,
                serverHttpRequest)
            .map(
                jc -> {
                  String activeTabId = (String) command.data().get("__activeTabId");

                  var stepAfterRun = jc.steps().get(stepId);
                  if (stepAfterRun != null) { // it can be null if we started a new journey

                    var view = stepAfterRun.view();
                    var main = view.main();

                    var newSteps = new HashMap<>(jc.steps());
                    newSteps.put(
                        stepId,
                        new Step(
                            stepAfterRun.id(),
                            stepAfterRun.name(),
                            stepAfterRun.type(),
                            stepAfterRun.view(),
                            stepAfterRun.previousStepId(),
                            stepAfterRun.target(),
                            stepAfterRun.components().entrySet().stream()
                                .map(
                                    c ->
                                        new Pair<String, Component>(
                                            c.getKey(),
                                            (Component)
                                                new GenericComponent(
                                                    c.getValue().metadata() instanceof Form f
                                                        ? new Form(
                                                            f.icon(),
                                                            f.title(),
                                                            f.readOnly(),
                                                            f.subtitle(),
                                                            f.status(),
                                                            f.badges(),
                                                            f.tabs().stream()
                                                                .map(
                                                                    t ->
                                                                        new Tab(
                                                                            t.id(),
                                                                            !Strings.isNullOrEmpty(
                                                                                    activeTabId)
                                                                                && activeTabId
                                                                                    .equals(t.id()),
                                                                            t.caption()))
                                                                .toList(),
                                                            f.banners(),
                                                            f.sections(),
                                                            f.actions(),
                                                            f.mainActions(),
                                                            f.validations(),
                                                            f.rules())
                                                        : c.getValue().metadata(),
                                                    c.getValue().id(),
                                                    c.getValue().className(),
                                                    c.getValue().attributes(),
                                                    c.getValue().data(),
                                                    c.getValue().childComponentIds())))
                                .collect(Collectors.toMap(p -> p.getKey(), p -> p.getValue()))));
                    return new JourneyContainer(
                        jc.journeyId(),
                        jc.journeyTypeId(),
                        jc.journey(),
                        newSteps,
                        Stream.concat(jc.stepHistory().stream(), Stream.of(stepId))
                            .distinct()
                            .toList(),
                        jc.initialStep(),
                        jc.modalMustBeClosed());
                  }
                  return jc;
                });
      }
    }

    throw new Exception("Unknown action " + actionId);
  }

  private void fillViewInstanceWithData(Object viewInstance, Map<String, Object> data) {
    if (viewInstance instanceof ObjectEditor) {
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
  }

  private Mono<JourneyContainer> handleBackToStep(
      JourneyContainer journeyContainer, String stepId) {
    var journey = journeyContainer.journey();
    var stepsToRemove =
        journeyContainer.stepHistory().stream()
            .skip(journeyContainer.stepHistory().indexOf(stepId) + 1)
            .toList();
    journeyContainer =
        new JourneyContainer(
            journeyContainer.journeyId(),
            journeyContainer.journeyTypeId(),
            new Journey(journey.type(), journey.status(), journey.statusMessage(), stepId, "xxx"),
            journeyContainer.steps().entrySet().stream()
                .filter(e -> !stepsToRemove.contains(e.getKey()))
                .collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue())),
            journeyContainer.stepHistory().stream()
                .filter(v -> !stepsToRemove.contains(v))
                .toList(),
            journeyContainer.initialStep(),
            true);
    journeyContainer = resetMessages(journeyContainer);

    return Mono.just(journeyContainer);
  }

  @SneakyThrows
  private Object getViewInstance(
      JourneyContainer journeyContainer,
      String stepId,
      String componentId,
      ServerHttpRequest serverHttpRequest) {
    var component = journeyContainer.steps().get(stepId).components().get(componentId);
    return reflectionHelper.newInstance(Class.forName(component.className()));
  }

  private JourneyContainer resetMessages(JourneyContainer journeyContainer) {
    var currentStepId = journeyContainer.journey().currentStepId();
    var step = journeyContainer.steps().get(currentStepId);
    var view = step.view();
    var steps = new HashMap<>(journeyContainer.steps());
    steps.put(
        currentStepId,
        new Step(
            step.id(),
            step.name(),
            step.type(),
            new View(
                List.of(), view.header(), view.left(), view.main(), view.right(), view.footer()),
            step.previousStepId(),
            step.target(),
            step.components()));
    return new JourneyContainer(
        journeyContainer.journeyId(),
        journeyContainer.journeyTypeId(),
        journeyContainer.journey(),
        steps,
        journeyContainer.stepHistory(),
        journeyContainer.initialStep(),
        journeyContainer.modalMustBeClosed());
  }
}
