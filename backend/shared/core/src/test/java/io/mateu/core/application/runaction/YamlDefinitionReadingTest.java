package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.SpecsDir;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.OnLoadTrigger;
import java.nio.file.Path;
import java.util.Map;
import java.util.function.Function;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * How a definition file becomes a page spec — the rules a YAML author relies on. A definition that
 * cannot be read answers "Page not found", so each rule here is also a promise that the reason is
 * reported (in the spec problems the development not-found page lists), not swallowed.
 */
class YamlDefinitionReadingTest {

  @TempDir Path dir;

  /** Runs {@code body} with {@code files} as the only {@code specs/ui} and a fresh loader. */
  private <T> T with(Map<String, String> files, Function<YamlUidlLoader, T> body) {
    var root = SpecsDir.write(dir, files);
    return SpecsDir.over(root, cl -> body.apply(new YamlUidlLoader(new RouteRegistry())));
  }

  private static final String MOUNT =
      """
      type: UI
      basePath: /
      routes:
        - routes.yaml
      """;

  private static final String HELLO =
      """
      layout:
        type: VerticalLayout
        content:
          - type: Text
            text: Hello
      """;

  @Test
  void aRouteNamingALayoutFileThatDoesNotExistSaysSo() {
    var problems =
        with(
            Map.of(
                "app.ui.yaml",
                MOUNT,
                "routes.yaml",
                """
                type: Routes
                routes:
                  - route: orders
                    layout: order-list.yaml
                """),
            loader -> {
              assertThat(loader.loadSpec("orders")).isNull();
              return loader.specProblems().forRoute("orders");
            });
    assertThat(problems).hasSize(1);
    assertThat(problems.get(0))
        .contains("route \"orders\"")
        .contains("order-list.yaml")
        .contains("specs/ui/order-list.yaml does not exist");
  }

  @Test
  void anUnreadableDefinitionIsReportedWithItsLineAndFixingItClearsTheReport() {
    var broken =
        """
        layout:
          type: FormLayout
          content:
            - type: FormField
              id: amount
              dataType: decimal
        """;
    var problems =
        with(
            Map.of("broken.yaml", broken),
            loader -> {
              assertThat(loader.loadSpec("broken")).isNull();
              return loader.specProblems().forRoute("broken");
            });
    assertThat(problems).singleElement().asString().contains("specs/ui/broken.yaml, line 6");
    assertThat(problems.get(0)).contains("\"decimal\" is not a valid value");
  }

  @Test
  void anExplicitSpecPathThatDoesNotParseIsReportedToo() {
    var problems =
        with(
            Map.of("bad.yaml", "layout:\n  type: NoSuchComponent\n"),
            loader -> {
              assertThat(loader.loadFromSpec("specs/ui/bad.yaml")).isNull();
              return loader.specProblems().all();
            });
    assertThat(problems)
        .singleElement()
        .asString()
        .contains("specs/ui/bad.yaml")
        .contains("unknown type \"NoSuchComponent\"");
  }

  @Test
  void theLivePreviewParsesAnEnvelopeOrABareTreeAndNothingOnBadInput() {
    var loader = new YamlUidlLoader();
    assertThat(loader.parseText(HELLO)).isInstanceOf(VerticalLayout.class);
    assertThat(loader.parseText("type: Text\ntext: bare\n"))
        .isInstanceOfSatisfying(Text.class, t -> assertThat(t.text()).isEqualTo("bare"));
    assertThat(loader.parseText("   ")).isNull();
    assertThat(loader.parseText(null)).isNull();
    assertThat(loader.parseText("type: NoSuchComponent\n")).isNull();
  }

  @Test
  void aDefinitionAddressedFromTheClasspathRootIsReadFromThere() {
    var spec =
        with(
            Map.of(
                "app.ui.yaml",
                MOUNT,
                "routes.yaml",
                """
                type: Routes
                routes:
                  - route: hello
                    layout: /specs/ui/pages/hello-page.yaml
                """,
                "pages/hello-page.yaml",
                HELLO),
            loader -> loader.loadSpec("hello"));
    assertThat(spec).isNotNull();
    assertThat(spec.layout()).isInstanceOf(VerticalLayout.class);
  }

  @Test
  void theViewModelComesFromTheRouteUnlessTheDefinitionNamesOneAndViewModelBeatsModelView() {
    var files =
        Map.of(
            "app.ui.yaml",
            MOUNT,
            "routes.yaml",
            """
            type: Routes
            routes:
              - route: bound
                layout: shared.yaml
                viewModel: com.example.FromRoute
              - route: inline
                layout: inline.yaml
                viewModel: com.example.FromRoute
            """,
            "shared.yaml",
            HELLO,
            "inline.yaml",
            "viewModel: com.example.Canonical\nmodelView: com.example.Alias\n" + HELLO);
    with(
        files,
        loader -> {
          assertThat(loader.loadSpec("bound").modelView()).isEqualTo("com.example.FromRoute");
          assertThat(loader.loadSpec("inline").modelView()).isEqualTo("com.example.Canonical");
          return null;
        });
  }

  @Test
  void theLayoutAndPageTypeOnlyApplyToTheDeclaredViewModel() {
    var files =
        Map.of(
            "typed.yaml",
            "modelView: " + Owner.class.getName() + "\npageType: DashBoard\n" + HELLO,
            "typo.yaml",
            "modelView: " + Owner.class.getName() + "\npageType: dashbord\n" + HELLO);
    with(
        files,
        loader -> {
          assertThat(loader.layoutForRoute("typed", Owner.class))
              .isInstanceOf(VerticalLayout.class);
          assertThat(loader.layoutForRoute("typed", Other.class)).isNull();
          assertThat(loader.layoutForRoute("typed", null)).isNull();
          // declared case-insensitively, emitted as the wire name
          assertThat(loader.pageTypeForRoute("typed", Owner.class)).isEqualTo("dashboard");
          assertThat(loader.pageTypeForRoute("typed", Other.class)).isNull();
          // a typo never costs the page: the type is just inferred instead
          assertThat(loader.pageTypeForRoute("typo", Owner.class)).isNull();
          assertThat(loader.layoutForRoute("typo", Owner.class)).isNotNull();
          return null;
        });
  }

  @Test
  void aLayoutDeltaIsReadWholeAndOnlyForItsViewModel() {
    var delta =
        """
        modelView: %s
        layoutDelta:
          order: [name, email]
          hidden: [internalCode]
          overrides:
            email: {label: E-mail, colspan: 2, section: Contact}
            name: {}
        """
            .formatted(Owner.class.getName());
    with(
        Map.of("tuned.yaml", delta),
        loader -> {
          var spec = loader.loadSpec("tuned");
          assertThat(spec.layout()).as("a delta page has no explicit layout").isNull();
          var read = loader.deltaForRoute("tuned", Owner.class);
          assertThat(read.order()).containsExactly("name", "email");
          assertThat(read.hidden()).containsExactly("internalCode");
          assertThat(read.overrides().get("email").label()).isEqualTo("E-mail");
          assertThat(read.overrides().get("email").colspan()).isEqualTo(2);
          assertThat(read.overrides().get("email").section()).isEqualTo("Contact");
          assertThat(read.overrides().get("name").label()).isNull();
          assertThat(read.overrides().get("name").colspan()).isNull();
          assertThat(loader.deltaForRoute("tuned", Other.class).isEmpty()).isTrue();
          assertThat(loader.deltaForRoute("nowhere", Owner.class).isEmpty()).isTrue();
          return null;
        });
  }

  @Test
  void oneMalformedActionOrTriggerDoesNotCostThePage() {
    var page =
        HELLO
            + """
            actions:
              - id: save
                restAction:
                  source: {url: https://api.invalid/save, method: POST}
              - id: broken
                confirmationRequired: {not: a boolean}
            triggers:
              - type: OnLoadTrigger
                actionId: refresh
              - type: NoSuchTrigger
                actionId: never
            """;
    var spec = with(Map.of("busy.yaml", page), loader -> loader.loadSpec("busy"));
    assertThat(spec).isNotNull();
    assertThat(spec.actions()).extracting(a -> a.id()).containsExactly("save");
    assertThat(spec.triggers())
        .singleElement()
        .isInstanceOfSatisfying(
            OnLoadTrigger.class, t -> assertThat(t.actionId()).isEqualTo("refresh"));
  }

  public static class Owner {}

  public static class Other {}
}
