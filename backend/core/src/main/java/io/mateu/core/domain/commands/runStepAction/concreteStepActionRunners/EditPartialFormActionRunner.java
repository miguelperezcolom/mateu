package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import com.google.common.base.Strings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.interfaces.PartialForm;
import io.mateu.dtos.*;
import io.mateu.dtos.JourneyContainer;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
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

    var metadata = step.getView().getMain().getComponents().get(0).getMetadata();

    var sections = ((Form) metadata).getSections();

    var actions = new ArrayList<>();

    var actionCancel =
        Action.builder()
            .id(CANCEL_PARTIAL_FORM_IDENTIFIER + sectionId)
            .caption("Discard")
            .type(ActionType.Secondary)
            .validationRequired(false)
            .visible(true)
            .build();
    actions.add(actionCancel);

    var partialForm = getOrInitializeIfNotPresent(viewInstance, sectionId);

    updatedSectionToReadOnlyFalse(sectionId, sections, actions, actionCancel, partialForm);

    storeDataReminder(step, sectionId);

    store.updateStep(journeyContainer, stepId, step);

    return Mono.empty();
  }

  private PartialForm getOrInitializeIfNotPresent(Object viewInstance, String sectionId)
      throws NoSuchMethodException,
          IllegalAccessException,
          InvocationTargetException,
          InstantiationException {
    var partialFormField = reflectionHelper.getFieldByName(viewInstance.getClass(), sectionId);
    var partialForm = (PartialForm) reflectionHelper.getValue(partialFormField, viewInstance);
    if (partialForm == null) {
      partialForm = (PartialForm) reflectionHelper.newInstance(partialFormField.getType());
      reflectionHelper.setValue(partialFormField, viewInstance, partialForm);
    }
    return partialForm;
  }

  private void updatedSectionToReadOnlyFalse(
      String sectionId,
      List<Section> sections,
      ArrayList<Object> actions,
      Action actionCancel,
      PartialForm partialForm) {
    var actionSave =
        Action.builder()
            .id(SAVE_PARTIAL_FORM_IDENTIFIER + sectionId)
            .caption("Save")
            .type(ActionType.Primary)
            .confirmationRequired(!Strings.isNullOrEmpty(partialForm.confirmationMessage()))
            .confirmationTexts(
                ConfirmationTexts.builder()
                    .title(partialForm.confirmationTitle())
                    .message(partialForm.confirmationMessage())
                    .action("Save")
                    .build())
            .validationRequired(true)
            .visible(true)
            .build();
    actions.add(actionSave);

    for (var section : sections) {
      if (section.getId().equals(sectionId)) {
        section.setReadOnly(false);
        section.setActions(List.of(actionCancel, actionSave));
      }
    }
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
