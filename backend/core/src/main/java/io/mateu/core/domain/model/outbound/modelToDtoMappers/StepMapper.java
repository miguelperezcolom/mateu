package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.uidefinition.core.interfaces.DynamicStep;
import io.mateu.core.domain.uidefinition.core.interfaces.JpaRpcCrudFactory;
import io.mateu.core.domain.uidefinition.shared.interfaces.JpaCrud;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.Rule;
import io.mateu.dtos.Step;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StepMapper {

  private final ViewMapper viewMapper;
  private final JpaRpcCrudFactory jpaRpcCrudFactory;
  private final CaptionProvider captionProvider;

  public Step map(
      JourneyContainer journeyContainer,
      String stepId,
      String previousStepId,
      Object formInstance,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    if (formInstance instanceof JpaCrud) {
      formInstance = jpaRpcCrudFactory.create((JpaCrud) formInstance);
    }

    Map<String, Object> data = new HashMap<>();
    List<Rule> rules = new ArrayList<>();

    if (formInstance instanceof DynamicStep) {
      return ((DynamicStep) formInstance).build().toFuture().get();
    }

    return Step.builder()
        .id(stepId)
        .type(formInstance.getClass().getName())
        .name(captionProvider.getCaption(formInstance))
        .view(
            viewMapper.map(journeyContainer, stepId, formInstance, data, rules, serverHttpRequest))
        .data(data)
        .rules(rules)
        .previousStepId(previousStepId)
        .build();
  }
}
