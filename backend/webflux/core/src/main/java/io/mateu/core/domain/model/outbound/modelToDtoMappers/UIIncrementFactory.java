package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import io.mateu.dtos.*;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UIIncrementFactory {
  public UIIncrement createForSingleComponent(Component component, String componentId) {
    return createForSingleComponent(component, ActionTarget.Component, componentId);
  }

  public UIIncrement createForSingleComponent(Component component) {
    return createForSingleComponent(component, ActionTarget.View, "");
  }

  public UIIncrement createForSingleComponent(
      Component component, ActionTarget actionTarget, String targetId) {
    return new UIIncrement(
        List.of(),
        List.of(),
        List.of(
            new UIFragment(
                actionTarget,
                targetId,
                "",
                new SingleComponent(component.id()),
                Map.of(component.id(), component))));
  }
}
