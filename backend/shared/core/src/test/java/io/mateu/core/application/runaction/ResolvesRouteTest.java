package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.components.SampleComponent;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ElementDto;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ResolvesRouteTest extends RunActionUseCaseTest {

  @Test
  void resolvesRoute() {
    var increment =
        useCase
            .handle(
                new RunActionCommand(
                    "base_url",
                    "ui_id",
                    "/app",
                    "consumed_route",
                    "",
                    Map.of(),
                    Map.of(),
                    "initiator_component_id",
                    new FakeHttpRequest(),
                    SampleComponent.class.getName()))
            .blockLast();
    assertThat(increment).isNotNull();
    assertThat(increment.fragments().size()).isEqualTo(1);
    assertThat(increment.fragments().get(0)).isNotNull();
    var component = increment.fragments().get(0).component();
    assertThat(component).isNotNull();
    assertThat(component).isInstanceOf(ClientSideComponentDto.class);
    var clientSideComponent = (ClientSideComponentDto) component;
    var metadata = clientSideComponent.metadata();
    assertThat(metadata).isNotNull();
    assertThat(metadata).isInstanceOf(ElementDto.class);
  }
}
