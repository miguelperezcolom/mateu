package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.OnCustomEventTriggerDto;
import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.OnValueChangeTriggerDto;
import io.mateu.dtos.ServerSideComponentDto;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A definition-only page (no view model, no Java anywhere) that declares its own {@code triggers:}.
 *
 * <p>The flow-effect mirror of {@link YamlDeclaredActionsSyncTest}. The wire and the mapper were
 * both ready: {@code TriggerMapper.mapTriggers} already maps every {@code Trigger} record a {@code
 * TriggersSupplier} yields. What these tests pin is that a classless YAML page can now put an
 * on-load / on-custom-event / on-value-change trigger there and have it reach the wire.
 */
class YamlDeclaredTriggersSyncTest {

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ServerSideComponentDto page() {
    var increment = mateu.sync("/yaml-triggers");
    assertThat(increment.fragments()).as("the page should render").isNotEmpty();
    var component = increment.fragments().get(0).component();
    assertThat(component)
        .as("a page declaring triggers is a server-side component, not a bare layout")
        .isInstanceOf(ServerSideComponentDto.class);
    return (ServerSideComponentDto) component;
  }

  @Test
  void anOnLoadTriggerReachesTheWire() {
    var onLoad =
        page().triggers().stream()
            .filter(OnLoadTriggerDto.class::isInstance)
            .map(OnLoadTriggerDto.class::cast)
            .filter(t -> "preload".equals(t.actionId()))
            .findFirst();
    assertThat(onLoad).as("the declared OnLoadTrigger should reach the wire").isPresent();
  }

  @Test
  void anOnCustomEventTriggerCarriesItsEventName() {
    var onEvent =
        page().triggers().stream()
            .filter(OnCustomEventTriggerDto.class::isInstance)
            .map(OnCustomEventTriggerDto.class::cast)
            .filter(t -> "refresh".equals(t.actionId()))
            .findFirst()
            .orElseThrow();
    assertThat(onEvent.eventName()).isEqualTo("something-happened");
  }

  @Test
  void anOnValueChangeTriggerCarriesItsPropertyName() {
    var onChange =
        page().triggers().stream()
            .filter(OnValueChangeTriggerDto.class::isInstance)
            .map(OnValueChangeTriggerDto.class::cast)
            .filter(t -> "recompute".equals(t.actionId()))
            .findFirst()
            .orElseThrow();
    assertThat(onChange.propertyName()).isEqualTo("amount");
  }

  @Test
  void aPageWithoutDeclaredTriggersFiresNoneOfThem() {
    // The static about.yaml page keeps its bare-layout shape — no declared triggers of its own.
    var increment = mateu.sync("/about");
    var component = increment.fragments().get(0).component();
    if (component instanceof ServerSideComponentDto serverSide && serverSide.triggers() != null) {
      assertThat(serverSide.triggers())
          .noneMatch(
              t -> t instanceof OnValueChangeTriggerDto vc && "recompute".equals(vc.actionId()));
    }
  }
}
