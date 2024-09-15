package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import io.mateu.dtos.Component;
import io.mateu.dtos.SingleComponent;
import io.mateu.dtos.UIFragment;
import io.mateu.dtos.UIIncrement;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UIIncrementFactory {

  public UIIncrement createForSingleComponent(Component component) {
    return new UIIncrement(
        List.of(),
        List.of(),
        List.of(
            new UIFragment(
                io.mateu.dtos.ActionTarget.View,
                "",
                "",
                new SingleComponent(component.id()),
                Map.of(component.id(), component))));
  }
}
