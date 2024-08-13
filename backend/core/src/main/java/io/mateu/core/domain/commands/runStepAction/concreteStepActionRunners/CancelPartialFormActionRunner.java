package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.dtos.*;
import io.mateu.dtos.JourneyContainer;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class CancelPartialFormActionRunner implements ActionRunner {

  public static final String CANCEL_PARTIAL_FORM_IDENTIFIER = "cancelPartialForm__";

  public static final String EDIT_PARTIAL_FORM_IDENTIFIER = "editPartialForm__";

  final JourneyContainerService store;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return actionId.startsWith(CANCEL_PARTIAL_FORM_IDENTIFIER);
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

    var sectionId = getSectionIdFromActionId(actionId);

    journeyContainer = store.setAsCurrentStep(journeyContainer, stepId);
    var step = journeyContainer.steps().get(stepId);
    var view = step.view();
    var main = view.main();
    var mainComponent = step.view().main().components().get(0);

    step =
        new Step(
            step.id(),
            step.name(),
            step.type(),
            new View(
                view.title(),
                view.subtitle(),
                view.messages(),
                view.header(),
                view.left(),
                new ViewPart(
                    main.classes(),
                    Stream.concat(
                            Stream.of(
                                new Component(
                                    updateMetadata(
                                        viewInstance, sectionId, (Form) mainComponent.metadata()),
                                    mainComponent.id(),
                                    mainComponent.attributes())),
                            main.components().stream().skip(1))
                        .toList()),
                view.right(),
                view.footer()),
            step.data(),
            step.rules(),
            step.previousStepId(),
            step.target());

    step = restoreOldData(step, sectionId);

    journeyContainer = store.updateStep(journeyContainer, stepId, step);

    return Mono.just(journeyContainer);
  }

  private ViewMetadata updateMetadata(Object viewInstance, String sectionId, Form metadata) {
    return new Form(
        metadata.dataPrefix(),
        metadata.icon(),
        metadata.title(),
        metadata.readOnly(),
        metadata.subtitle(),
        metadata.status(),
        metadata.badges(),
        metadata.tabs(),
        metadata.banners(),
        updatedSections(viewInstance, sectionId, metadata.sections()),
        metadata.actions(),
        metadata.mainActions(),
        metadata.validations());
  }

  private List<Section> updatedSections(
      Object viewInstance, String sectionId, List<Section> sections) {
    return sections.stream()
        .map(
            s -> {
              if (sectionId.equals(s.id()) && !s.readOnly()) {
                return updatedSectionToReadOnly(s);
              }
              return s;
            })
        .toList();
  }

  private Section updatedSectionToReadOnly(Section s) {
    return new Section(
        s.id(),
        s.tabId(),
        s.caption(),
        s.description(),
        true,
        s.type(),
        s.leftSideImageUrl(),
        s.topImageUrl(),
        List.of(
            new Action(
                EDIT_PARTIAL_FORM_IDENTIFIER + s.id(),
                "Edit",
                ActionType.Secondary,
                true,
                false,
                false,
                false,
                null,
                ActionTarget.SameLane,
                null,
                null,
                null)),
        s.fieldGroups());
  }

  private Step restoreOldData(Step step, String sectionId) {
    var data = new HashMap<>(step.data());
    Map<String, Object> oldData =
        (Map<String, Object>) data.get("__partialFormDataReminder__" + sectionId);
    data.putAll(oldData);
    return new Step(
        step.id(),
        step.name(),
        step.type(),
        step.view(),
        data,
        step.rules(),
        step.previousStepId(),
        step.target());
  }

  private String getSectionIdFromActionId(String actionId) {
    return actionId.replace(CANCEL_PARTIAL_FORM_IDENTIFIER, "");
  }
}
