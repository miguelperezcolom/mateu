package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.components.SampleComponent;
import io.mateu.core.infra.FakeHttpRequest;
import java.util.Map;
import org.junit.jupiter.api.Test;

class MethodIsCalledTest extends RunActionUseCaseTest {

  @Test
  void methodIsCalled() {
    var increment =
        useCase
            .handle(
                new RunActionCommand(
                    "base_url",
                    "ui_id",
                    "xx",
                    "consumed_route",
                    "sayHello",
                    Map.of(),
                    Map.of(),
                    "initiator_component_id",
                    new FakeHttpRequest(),
                    SampleComponent.class.getName()))
            .blockLast();
    assertThat(increment).isNotNull();
  }
}
