package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.interfaces.PartialForm;
import io.mateu.dtos.*;

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

  final JourneyContainerService store;
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

    var mainComponent = step.getView().getMain().getComponents().get(0);

    var sectionId = actionId.substring(SAVE_PARTIAL_FORM_IDENTIFIER.length());

    mainComponent.setMetadata(updateMetadata((Form) mainComponent.getMetadata(), sectionId));

    var partialForm = getOrInitializeIfNotPresent(form, sectionId);

    partialForm.save();

    store.updateStep(journeyContainer, stepId, step);

    return Mono.empty();
  }

  private ViewMetadata updateMetadata(Form form, String sectionId) {
    return new Form(
            form.dataPrefix(),
            form.icon(),
            form.title(),
            form.readOnly(),
            form.subtitle(),
            form.status(),
            form.badges(),
            form.tabs(),
            form.banners(),
            updatePartialFormSectionToReadOnly(form.sections(), sectionId),
            form.actions(),
            form.mainActions(),
            form.validations()
    );
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

  private List<Section> updatePartialFormSectionToReadOnly(List<Section> sections, String sectionId) {
    return sections.stream().map(s -> (sectionId.equals(s.id()) && !s.readOnly())?new Section(
            s.id(),
            s.tabId(),
            s.caption(),
            s.description(),
            true,
            s.type(),
            s.leftSideImageUrl(),
            s.topImageUrl(),
            List.of(new Action(
                    EDIT_PARTIAL_FORM_IDENTIFIER + sectionId,
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
                    null
            )),
            s.fieldGroups()
    ):s).toList();
  }
}
