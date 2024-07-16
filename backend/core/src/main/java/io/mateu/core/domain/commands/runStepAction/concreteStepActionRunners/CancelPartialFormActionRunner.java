package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.dtos.*;
import io.mateu.remote.dtos.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class CancelPartialFormActionRunner implements ActionRunner {

  public static final String CANCEL_PARTIAL_FORM_IDENTIFIER = "cancelPartialForm__";

  public static final String EDIT_PARTIAL_FORM_IDENTIFIER = "editPartialForm__";

  final JourneyStoreService store;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return actionId.startsWith(CANCEL_PARTIAL_FORM_IDENTIFIER);
  }

  @Override
  public Mono<Void> run(
      Object viewInstance,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    var sectionId = getSectionIdFromActionId(actionId);

    var step = store.getStep(journeyId, stepId);

    var metadata = step.getView().getMain().getComponents().get(0).getMetadata();

    var sections = ((Form) metadata).getSections();

    var actions = new ArrayList<>();

    updatedSectionToReadOnly(sectionId, sections, actions);

    restoreOldData(step, sectionId);

    store.updateStep(journeyId, stepId, step);

    return Mono.empty();
  }

  private void updatedSectionToReadOnly(
          String sectionId, List<Section> sections, ArrayList<Object> actions) {
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
