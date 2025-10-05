package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.components.SampleComponent;
import io.mateu.core.infra.FakeHttpRequest;
import java.util.Map;

import io.mateu.dtos.RunActionRqDto;
import org.junit.jupiter.api.Test;

class MethodIsCalledTest extends RunActionUseCaseTest {

  @Test
  void methodIsCalled() {

      var rq = new RunActionRqDto(
              Map.of(), // component state
              Map.of(), // app state
              Map.of(), // parameters
              "initiator_component_id",
              "consumed_route",
              "sayHello",
              "route",
              SampleComponent.class.getName() // server side type
      );

      var httpRequest = new FakeHttpRequest();
      httpRequest.storeRunActionRqDto(rq);

    var increment =
        useCase
            .handle(
                new RunActionCommand(
                    "base_url",
                    "ui_id",
                    rq.route(),
                    rq.consumedRoute(),
                    rq.actionId(),
                    rq.componentState(),
                    rq.appState(),
                    rq.initiatorComponentId(),
                    httpRequest,
                    rq.serverSideType()
                ))
            .blockLast();
    assertThat(increment).isNotNull();
  }
}
