package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import io.mateu.dtos.*;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UIIncrementFactory {
  public UIIncrementDto createForSingleComponent(ComponentDto component, String componentId) {
    return createForSingleComponent(component, ActionTargetDto.Component, componentId);
  }

  public UIIncrementDto createForSingleComponent(ComponentDto component) {
    return createForSingleComponent(component, ActionTargetDto.View, "");
  }

  public UIIncrementDto createForSingleComponent(
      ComponentDto component, ActionTargetDto actionTarget, String targetId) {
    return new UIIncrementDto(
        List.of(),
        List.of(),
        List.of(
            new UIFragmentDto(
                actionTarget,
                targetId,
                "",
                "",
                new SingleComponentDto(component.id()),
                Map.of(component.id(), component))));
  }
}
