package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.components.AnnotatedComponent;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ReturnsComponentTest extends RunActionUseCaseTest {

  @Test
  void returnsComponent() {
    var increment =
        useCase
            .handle(
                new RunActionCommand(
                    "base_url",
                    "ui_id",
                    "/sample-app/route_3",
                    "",
                    "",
                    Map.of(),
                    Map.of(),
                    "initiator_component_id",
                    new FakeHttpRequest().storeRunActionRqDto(RunActionRqDto.builder().build()),
                    AnnotatedComponent.class.getName()))
            .blockLast();
    assertThat(increment).isNotNull();
  }
}
