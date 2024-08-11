package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import com.google.common.base.Strings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.interfaces.PartialForm;
import io.mateu.dtos.*;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

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

    var mainComponent = step.getView().getMain().getComponents().get(0);

    mainComponent.setMetadata(updateMetadata(viewInstance, sectionId, (Form) mainComponent.getMetadata()));

    storeDataReminder(step, sectionId);

    store.updateStep(journeyContainer, stepId, step);

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
            metadata.validations()
    );
  }

  private List<Section> updateSection(Object viewInstance, String sectionId, List<Section> sections) {
    return sections.stream()
            .map(s -> {
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

  private Section updatedSectionToReadOnlyFalse(
      Section s,
      PartialForm partialForm) {

    return new Section(
            s.id(),
            s.tabId(),
            s.caption(),
            s.description(),
            false,
            s.type(),
            s.leftSideImageUrl(),
            s.topImageUrl(),
            Stream.concat(s.actions().stream(), Stream.of(new Action(
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
                            SAVE_PARTIAL_FORM_IDENTIFIER + s.id(), "Save", ActionType.Primary,
                            true,
                            true,
                            !Strings.isNullOrEmpty(partialForm.confirmationMessage()),
                            false,
                            new ConfirmationTexts(partialForm.confirmationTitle(), partialForm.confirmationMessage(), "Save"),
                            ActionTarget.SameLane,
                            null,
                            null,
                            null))).toList(),
            s.fieldGroups()
    );
  }

  private void storeDataReminder(Step step, String sectionId) {
    var data = step.getData();
    Map<String, Object> currentData = new HashMap<>();
    data.keySet().stream()
        .filter(k -> k.startsWith("__nestedData__" + sectionId + "__"))
        .forEach(k -> currentData.put(k, data.get(k)));
    data.put("__partialFormDataReminder__" + sectionId, currentData);
  }

  private String getSectionIdFromActionId(String actionId) {
    return actionId.replace(EDIT_PARTIAL_FORM_IDENTIFIER, "");
  }
}
