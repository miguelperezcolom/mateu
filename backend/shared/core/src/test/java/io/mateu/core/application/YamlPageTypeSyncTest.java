package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@code pageType:} on a YAML page definition — the data twin of {@code @PageTemplate}. A declared
 * type wins over the shape inference on every serving path (definition-only, bound to a view model,
 * a layout delta, an action round trip); an absent one leaves inference alone.
 */
class YamlPageTypeSyncTest {

  /** A plain view model: by shape it is a {@code form} page. */
  public static class PlainView {
    public String name = "World";

    @Action
    public Object stay() {
      return this;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PlainView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ServerSideComponentDto componentOf(UIIncrementDto increment) {
    assertThat(increment.fragments()).isNotEmpty();
    var component = increment.fragments().get(0).component();
    assertThat(component).isInstanceOf(ServerSideComponentDto.class);
    return (ServerSideComponentDto) component;
  }

  @Test
  void aDefinitionOnlyPageCarriesItsDeclaredType() {
    // Nothing else would wrap this static page; the declared type has to travel, so it is wrapped.
    assertThat(componentOf(mateu.sync("/page-type-landing")).pageType()).isEqualTo("landing");
  }

  @Test
  void aDeclaredTypeWinsOverTheViewModelsInferredShape() {
    var component = componentOf(mateu.sync("/page-type-bound"));
    assertThat(component.serverSideType()).isEqualTo(PlainView.class.getName());
    assertThat(component.pageType()).as("declared Dashboard, any case").isEqualTo("dashboard");
  }

  @Test
  void theDeclaredTypeSurvivesAnActionRoundTrip() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("page-type-bound")
                .serverSideType(PlainView.class.getName())
                .actionId("stay")
                .componentState(Map.of("name", "Leia"))
                .build());
    assertThat(componentOf(increment).pageType()).isEqualTo("dashboard");
  }

  @Test
  void aLayoutDeltaDefinitionCarriesItsDeclaredTypeToo() {
    assertThat(componentOf(mateu.sync("/page-type-delta")).pageType()).isEqualTo("detail");
  }

  @Test
  void anAbsentTypeIsInferred() {
    assertThat(componentOf(mateu.sync("/page-type-unbound")).pageType()).isEqualTo("form");
  }

  @Test
  void anUnknownTypeIsIgnoredAndInferred() {
    assertThat(componentOf(mateu.sync("/page-type-typo")).pageType()).isEqualTo("form");
  }

  @Test
  void aStaticPageWithoutATypeKeepsItsBareShape() {
    // unchanged wire: no declared type, no actions, no seeds → the bare layout, no wrapper
    var component = mateu.sync("/about").fragments().get(0).component();
    assertThat(component).isNotInstanceOf(ServerSideComponentDto.class);
  }
}
