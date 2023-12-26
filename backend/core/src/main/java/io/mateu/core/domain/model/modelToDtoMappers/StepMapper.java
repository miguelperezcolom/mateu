package io.mateu.core.domain.model.modelToDtoMappers;

import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.mdd.core.interfaces.DynamicStep;
import io.mateu.mdd.core.interfaces.JpaRpcCrudFactory;
import io.mateu.mdd.core.interfaces.Message;
import io.mateu.mdd.core.interfaces.ResponseWrapper;
import io.mateu.mdd.shared.interfaces.JpaCrud;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Rule;
import io.mateu.remote.dtos.Step;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StepMapper {

  private final ViewMapper viewMapper;
  private final ReflectionHelper reflectionHelper;
  private final JpaRpcCrudFactory jpaRpcCrudFactory;

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
        .name(reflectionHelper.getCaption(formInstance))
        .view(
            viewMapper.map(journeyContainer, stepId, formInstance, data, rules, serverHttpRequest))
        .data(data)
        .rules(rules)
        .previousStepId(previousStepId)
        .build();
  }

}
