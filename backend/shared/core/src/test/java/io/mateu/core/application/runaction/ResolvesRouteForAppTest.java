package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.helpers.Json.readJsonFromClasspath;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static net.javacrumbs.jsonunit.core.ConfigurationWhen.paths;
import static net.javacrumbs.jsonunit.core.ConfigurationWhen.then;
import static net.javacrumbs.jsonunit.core.Option.IGNORING_VALUES;

import com.example.components.SampleComponent;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import java.util.Map;
import net.javacrumbs.jsonunit.core.Option;
import org.junit.jupiter.api.Test;

class ResolvesRouteForAppTest extends RunActionUseCaseTest {

  @Test
  void resolvesRouteForApp() {
    var increment =
        useCase
            .handle(
                new RunActionCommand(
                    "base_url",
                    "ui_id",
                    "xx",
                    "consumed_route",
                    "",
                    Map.of(),
                    Map.of(),
                    "initiator_component_id",
                    new FakeHttpRequest().storeRunActionRqDto(RunActionRqDto.builder().build()),
                    SampleComponent.class.getName(),
                    ""))
            .blockLast();
    // System.out.println(toJson(increment));

    var json = readJsonFromClasspath(this.getClass(), "jsons/resolves-route-for-app.json");

    assertThatJson(increment)
        .when(
            Option.IGNORING_ARRAY_ORDER,
            Option.IGNORING_EXTRA_FIELDS,
            Option.TREATING_NULL_AS_ABSENT)
        .when(paths("fragments[*].component.id", "b"), then(IGNORING_VALUES))
        .isEqualTo(json);
  }
}
