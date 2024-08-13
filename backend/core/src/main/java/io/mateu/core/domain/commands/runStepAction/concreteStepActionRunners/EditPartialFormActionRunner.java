package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import com.google.common.base.Strings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.interfaces.PartialForm;
import io.mateu.dtos.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class EditPartialFormActionRunner implements ActionRunner {

  public static final String EDIT_PARTIAL_FORM_IDENTIFIER = "editPartialForm__";

  public static final String CANCEL_PARTIAL_FORM_IDENTIFIER = "cancelPartialForm__";

  public static final String SAVE_PARTIAL_FORM_IDENTIFIER = "savePartialForm__";

  final JourneyContainerService store;
  final ReflectionHelper reflectionHelper;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return actionId.startsWith(EDIT_PARTIAL_FORM_IDENTIFIER);
  }

  @Override
  public Mono<Void> run(
      JourneyContainer journeyContainer,
      Object viewInstance,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    var sectionId = getSectionIdFromActionId(actionId);

    var step = store.getStep(journeyContainer, stepId);

    var view = step.view();

    var main = view.main();

    var mainComponent = main.components().get(0);

    var newStep =
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
            storeDataReminder(step, sectionId),
            step.rules(),
            step.previousStepId(),
            step.target());

    storeDataReminder(step, sectionId);

    store.updateStep(journeyContainer, stepId, newStep);

    return Mono.empty();
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
        updateSection(viewInstance, sectionId, metadata.sections()),
        metadata.actions(),
        metadata.mainActions(),
        metadata.validations());
  }

  private List<Section> updateSection(
      Object viewInstance, String sectionId, List<Section> sections) {
    return sections.stream()
        .map(
            s -> {
              if (sectionId.equals(s.id())) {
                var partialForm = getOrInitializeIfNotPresent(viewInstance, sectionId);
                return updatedSectionToReadOnlyFalse(s, partialForm);
              }
              return s;
            })
        .toList();
  }

  @SneakyThrows
  private PartialForm getOrInitializeIfNotPresent(Object viewInstance, String sectionId) {
    var partialFormField = reflectionHelper.getFieldByName(viewInstance.getClass(), sectionId);
    var partialForm = (PartialForm) reflectionHelper.getValue(partialFormField, viewInstance);
    if (partialForm == null) {
      partialForm = (PartialForm) reflectionHelper.newInstance(partialFormField.getType());
      reflectionHelper.setValue(partialFormField, viewInstance, partialForm);
    }
    return partialForm;
  }

  private Section updatedSectionToReadOnlyFalse(Section s, PartialForm partialForm) {

    return new Section(
        s.id(),
        s.tabId(),
        s.caption(),
        s.description(),
        false,
        s.type(),
        s.leftSideImageUrl(),
        s.topImageUrl(),
        Stream.concat(
                s.actions().stream(),
                Stream.of(
                    new Action(
                        CANCEL_PARTIAL_FORM_IDENTIFIER + s.id(),
                        "Discard",
                        ActionType.Secondary,
                        true,
                        false,
                        false,
                        false,
                        null,
                        ActionTarget.SameLane,
                        null,
                        null,
                        null),
                    new Action(
                        SAVE_PARTIAL_FORM_IDENTIFIER + s.id(),
                        "Save",
                        ActionType.Primary,
                        true,
                        true,
                        !Strings.isNullOrEmpty(partialForm.confirmationMessage()),
                        false,
                        new ConfirmationTexts(
                            partialForm.confirmationTitle(),
                            partialForm.confirmationMessage(),
                            "Save"),
                        ActionTarget.SameLane,
                        null,
                        null,
                        null)))
            .toList(),
        s.fieldGroups());
  }

  private Map<String, Object> storeDataReminder(Step step, String sectionId) {
    var data = new HashMap<>(step.data());
    Map<String, Object> currentData = new HashMap<>();
    data.keySet().stream()
        .filter(k -> k.startsWith("__nestedData__" + sectionId + "__"))
        .forEach(k -> currentData.put(k, data.get(k)));
    data.put("__partialFormDataReminder__" + sectionId, currentData);
    return data;
  }

  private String getSectionIdFromActionId(String actionId) {
    return actionId.replace(EDIT_PARTIAL_FORM_IDENTIFIER, "");
  }
}
