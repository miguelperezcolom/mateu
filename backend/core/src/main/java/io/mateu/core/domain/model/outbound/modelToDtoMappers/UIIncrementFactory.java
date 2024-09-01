package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import io.mateu.dtos.Component;
import io.mateu.dtos.SingleComponent;
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
        new SingleComponent(component.id()),
        List.of(),
        Map.of(component.id(), component));
  }
}
