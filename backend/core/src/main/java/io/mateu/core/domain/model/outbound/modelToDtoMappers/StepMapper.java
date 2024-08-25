package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.uidefinition.core.interfaces.DynamicStep;
import io.mateu.core.domain.uidefinition.core.interfaces.JpaRpcCrudFactory;
import io.mateu.core.domain.uidefinition.shared.interfaces.JpaCrud;
import io.mateu.dtos.Component;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.Step;
import java.util.LinkedHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
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

    if (formInstance instanceof DynamicStep) {
      return ((DynamicStep) formInstance).build().toFuture().get();
    }

    var components = new LinkedHashMap<String, Component>();
    var view =
        viewMapper.map(journeyContainer, stepId, formInstance, serverHttpRequest, components);

    return new Step(
        stepId,
        captionProvider.getCaption(formInstance),
        formInstance.getClass().getName(),
        view,
        previousStepId,
        null,
        components);
  }
}
