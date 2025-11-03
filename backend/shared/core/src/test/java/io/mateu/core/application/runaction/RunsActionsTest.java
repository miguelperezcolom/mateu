package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.components.AnnotatedComponent;
import com.example.components.UsingInterfacesComponent;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class RunsActionsTest extends RunActionUseCaseTest {

  @Test
  void runsAction() {
    for (var componentType : List.of(AnnotatedComponent.class, UsingInterfacesComponent.class)) {
      var increment =
          useCase
              .handle(
                  new RunActionCommand(
                      "base_url",
                      "ui_id",
                      "component_id",
                      "consumed_route",
                      "sayHello",
                      Map.of(),
                      Map.of(),
                      "initiator_component_id",
                      new FakeHttpRequest().storeRunActionRqDto(RunActionRqDto.builder().build()),
                      componentType.getName()))
              .blockLast();
      assertThat(increment).isNotNull();
    }
  }
}
