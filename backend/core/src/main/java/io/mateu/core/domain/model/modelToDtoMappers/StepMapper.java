package io.mateu.core.domain.model.modelToDtoMappers;

import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Rule;
import io.mateu.remote.dtos.Step;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class StepMapper {

  @Autowired private ViewMapper viewMapper;

  public Step map(
      JourneyContainer journeyContainer,
      String stepId,
      String previousStepId,
      Object formInstance,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    Map<String, Object> data = new HashMap<>();
    List<Rule> rules = new ArrayList<>();

    return Step.builder()
        .id(stepId)
        .type(formInstance.getClass().getName())
        .name(ReflectionHelper.getCaption(formInstance))
        .view(
            viewMapper.map(journeyContainer, stepId, formInstance, data, rules, serverHttpRequest))
        .data(data)
        .rules(rules)
        .previousStepId(previousStepId)
        .build();
  }
}
