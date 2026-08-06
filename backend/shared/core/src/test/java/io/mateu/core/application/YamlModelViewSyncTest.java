package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.data.Message;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Phase 0 of the visual-builder work: a page defined in YAML can declare its ModelView (inverse of
 * {@code @UISpec}). The YAML supplies the layout, the referenced Java class supplies state and
 * actions, and Mateu's convention binding wires them together — on the first load AND on action
 * round-trips (which route by serverSideType, so the layout is re-applied by route).
 *
 * <p>The bound page is {@code specs/ui/yaml-bound.yaml} → {@link GreeterView}.
 */
class YamlModelViewSyncTest {

  /** The ModelView the YAML page points at — a plain class, no routing/layout annotations. */
  public static class GreeterView {
    public String name = "World";

    @Action
    public Message greet() {
      return new Message("Hello " + name + "!");
    }

    @Action
    public Object stay() {
      return this;
    }
  }

  static final String GREETER = GreeterView.class.getName();

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    // GreeterView carries no route, so /yaml-bound has no Java route → the YAML fallback fires.
    mateu = TestMateu.withUis(GreeterView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ServerSideComponentDto componentOf(UIIncrementDto increment) {
    assertThat(increment.fragments()).isNotEmpty();
    return (ServerSideComponentDto) increment.fragments().get(0).component();
  }

  @Test
  void yamlPagePointsAtItsModelViewAndRendersTheYamlLayoutBoundToIt() {
    var component = componentOf(mateu.sync("yaml-bound"));
    // the ModelView class is the server-side type (so state and actions route back to it) …
    assertThat(component.serverSideType()).isEqualTo(GREETER);
    // … and the layout came from the YAML file (a non-empty component subtree)
    assertThat(component.children()).isNotEmpty();
  }

  @Test
  void stateAndActionsBindByConventionToTheModelView() {
    // Button actionId "greet" → the ModelView's greet() method; FormField "name" → its name field.
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("yaml-bound")
                .serverSideType(GREETER)
                .actionId("greet")
                .componentState(Map.of("name", "Ada"))
                .build());
    List<MessageDto> messages = increment.messages();
    assertThat(messages).isNotEmpty();
    assertThat(messages.get(0).text()).isEqualTo("Hello Ada!");
  }

  @Test
  void anActionRoundTripReAppliesTheYamlLayout() {
    // stay() returns the ModelView → it is re-mapped; the layout must be re-applied by route even
    // though the action routed by serverSideType (the class is not @UISpec-annotated).
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("yaml-bound")
                .serverSideType(GREETER)
                .actionId("stay")
                .componentState(Map.of("name", "Bob"))
                .build());
    var component = componentOf(increment);
    assertThat(component.serverSideType()).isEqualTo(GREETER);
    assertThat(component.children()).isNotEmpty();
  }

  @Test
  void previewRendersArbitraryYamlTextForTheLiveEditor() {
    // The visual builder's preview: the editor's current (unsaved) YAML text is rendered into the
    // same wire increment a real route would produce.
    var yaml =
        "type: VerticalLayout\ncontent:\n  - type: Text\n    text: \"Hello preview\"\n"
            + "  - type: Button\n    label: \"Go\"\n    actionId: go\n";
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .actionId("__preview__")
                .initiatorComponentId("preview")
                .parameters(Map.of("_yaml", yaml))
                .build());
    assertThat(increment.fragments()).isNotEmpty();
    assertThat(increment.fragments().get(0).component()).isNotNull();
    assertThat(increment.fragments().get(0).component().children()).isNotEmpty();
  }

  @Test
  void aBareLayoutYamlWithoutAModelViewStillRenders() {
    // backward compatibility: the legacy shape (whole file is a component tree, no modelView)
    var increment = mateu.sync("demo/hello");
    assertThat(increment.fragments()).isNotEmpty();
    assertThat(increment.fragments().get(0).component()).isNotNull();
  }
}
