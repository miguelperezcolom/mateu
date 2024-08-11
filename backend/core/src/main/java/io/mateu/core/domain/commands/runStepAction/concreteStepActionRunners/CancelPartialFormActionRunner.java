package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import com.google.common.base.Strings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.interfaces.PartialForm;
import io.mateu.dtos.*;
import io.mateu.dtos.JourneyContainer;
import java.util.ArrayList;
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
public class CancelPartialFormActionRunner implements ActionRunner {

  public static final String CANCEL_PARTIAL_FORM_IDENTIFIER = "cancelPartialForm__";

  public static final String EDIT_PARTIAL_FORM_IDENTIFIER = "editPartialForm__";

  final JourneyContainerService store;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return actionId.startsWith(CANCEL_PARTIAL_FORM_IDENTIFIER);
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

    restoreOldData(step, sectionId);

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
            updatedSections(viewInstance, sectionId, metadata.sections()),
            metadata.actions(),
            metadata.mainActions(),
            metadata.validations()
    );
  }

  private List<Section> updatedSections(Object viewInstance, String sectionId, List<Section> sections) {
    return sections.stream()
            .map(s -> {
              if (sectionId.equals(s.id()) && !s.readOnly()) {
                return updatedSectionToReadOnly(s);
              }
              return s;
            })
            .toList();
  }

  private Section updatedSectionToReadOnly(
      Section s) {
    return new Section(
            s.id(),
            s.tabId(),
            s.caption(),
            s.description(),
            true,
            s.type(),
            s.leftSideImageUrl(),
            s.topImageUrl(),
            List.of(new Action(
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
                    null
            )),
            s.fieldGroups()
    );
  }

  private void restoreOldData(Step step, String sectionId) {
    var data = step.getData();
    Map<String, Object> oldData =
        (Map<String, Object>) data.get("__partialFormDataReminder__" + sectionId);
    data.putAll(oldData);
  }

  private String getSectionIdFromActionId(String actionId) {
    return actionId.replace(CANCEL_PARTIAL_FORM_IDENTIFIER, "");
  }
}
