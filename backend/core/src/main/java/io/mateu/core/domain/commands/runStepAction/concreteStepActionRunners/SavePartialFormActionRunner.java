package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.interfaces.PartialForm;
import io.mateu.dtos.Action;
import io.mateu.dtos.ActionType;
import io.mateu.dtos.Form;
import io.mateu.dtos.Section;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class SavePartialFormActionRunner implements ActionRunner {

  public static final String SAVE_PARTIAL_FORM_IDENTIFIER = "savePartialForm__";

  public static final String EDIT_PARTIAL_FORM_IDENTIFIER = "editPartialForm__";

  final JourneyStoreService store;
  final ReflectionHelper reflectionHelper;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return actionId.startsWith(SAVE_PARTIAL_FORM_IDENTIFIER);
  }

  @Override
  public Mono<Void> run(
      JourneyContainer journeyContainer,
      Object form,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    var step = store.getStep(journeyContainer, stepId);

    var metadata = step.getView().getMain().getComponents().get(0).getMetadata();

    var sections = ((Form) metadata).getSections();

    var sectionId = actionId.substring(SAVE_PARTIAL_FORM_IDENTIFIER.length());

    var partialForm = getOrInitializeIfNotPresent(form, sectionId);

    updateSectionToReadOnly(sections, sectionId);

    partialForm.save();

    store.updateStep(journeyContainer, stepId, step);

    return Mono.empty();
  }

  private PartialForm getOrInitializeIfNotPresent(Object form, String sectionId)
      throws NoSuchMethodException,
          IllegalAccessException,
          InvocationTargetException,
          InstantiationException {
    var partialFormField = reflectionHelper.getFieldByName(form.getClass(), sectionId);
    var partialForm = (PartialForm) reflectionHelper.getValue(partialFormField, form);
    if (partialForm == null) {
      partialForm = (PartialForm) reflectionHelper.newInstance(partialFormField.getType());
      reflectionHelper.setValue(partialFormField, form, partialForm);
    }
    return partialForm;
  }

  private void updateSectionToReadOnly(List<Section> sections, String sectionId) {

    var actions = new ArrayList<>();

    var actionEdit =
        Action.builder()
            .id(EDIT_PARTIAL_FORM_IDENTIFIER + sectionId)
            .caption("Edit")
            .type(ActionType.Secondary)
            .validationRequired(false)
            .visible(true)
            .build();
    actions.add(actionEdit);

    for (var section : sections) {
      if (section.getId().equals(sectionId) && !section.isReadOnly()) {
        section.setReadOnly(true);
        section.setActions(List.of(actionEdit));
      }
    }
  }
}
