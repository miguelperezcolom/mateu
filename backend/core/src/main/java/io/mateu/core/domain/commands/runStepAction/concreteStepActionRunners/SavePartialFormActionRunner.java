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
import java.util.stream.Stream;

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

    var view = step.view();

    var main = view.main();

    var mainComponent = main.components().get(0);

    var sectionId = actionId.substring(SAVE_PARTIAL_FORM_IDENTIFIER.length());

    var partialForm = getOrInitializeIfNotPresent(form, sectionId);

    partialForm.save();

    var newStep = new Step(
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
                            Stream.concat(Stream.of(new Component(
                                    updateMetadata((Form) mainComponent.metadata(), sectionId),
                                    mainComponent.id(),
                                    mainComponent.attributes()
                            )), main.components().stream().skip(1)).toList()
                    ),
                    view.right(),
                    view.footer()
            ),
            step.data(),
            step.rules(),
            step.previousStepId(),
            step.target()
    );

    store.updateStep(journeyContainer, stepId, newStep);

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
