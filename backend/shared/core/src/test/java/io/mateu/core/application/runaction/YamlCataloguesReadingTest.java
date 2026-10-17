package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.SpecsDir;
import io.mateu.uidl.data.Environment;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * The authored catalogues under {@code specs/ui} — actions, field types, partials, environments —
 * and the shapes an author may write them in. Each file kind takes an envelope ({@code actions:},
 * {@code types:}) or a bare list, and an entry that cannot stand (no id) is dropped rather than
 * costing the rest of the file.
 */
class YamlCataloguesReadingTest {

  @TempDir Path dir;

  @AfterEach
  void forgetPartials() {
    PartialRegistry.instance().reset();
  }

  private <T> T over(Map<String, String> files, Supplier<T> body) {
    var root = SpecsDir.write(dir, files);
    return SpecsDir.over(root, cl -> body.get());
  }

  // ── action catalogue ────────────────────────────────────────────────────────────────────────

  @Test
  void anActionCatalogueMayBeABareListAndAnEntryWithNoIdIsDropped() {
    var catalog =
        over(
            Map.of(
                "flows/common.yaml",
                // a bare list carries no `type:` header, so only the conventional file may be one
                "type: Actions\nactions:\n  - id: goHome\n    steps:\n      - {type: Navigate,"
                    + " route: home}\n",
                "actions.yaml",
                """
                - id: newOrder
                  steps:
                    - type: Navigate
                      route: orders/new
                - description: no id here
                  steps:
                    - type: Navigate
                      route: nowhere
                """),
            () -> new ActionRegistry().catalog());
    assertThat(catalog.actions())
        .extracting(a -> a.id())
        .containsExactlyInAnyOrder("newOrder", "goHome");
  }

  @Test
  void accessOnACatalogueEntryDecidesWhoIsShippedIt() {
    var files =
        Map.of(
            "actions.yaml",
            """
            type: Actions
            actions:
              - id: approve
                access: {roles: [manager]}
                steps:
                  - {type: Emit, event: approved}
              - id: view
                steps:
                  - {type: Emit, event: viewed}
            """);
    over(
        files,
        () -> {
          var registry = new ActionRegistry();
          assertThat(registry.restrictsAny()).isTrue();
          assertThat(registry.restrictedIds()).containsExactly("approve");
          assertThat(registry.accessOf("approve")).isNotNull();
          assertThat(registry.accessOf("view")).isNull();
          assertThat(registry.accessOf(null)).isNull();

          var clerk = request("clerk");
          var manager = request("manager");
          assertThat(registry.grants("approve", clerk)).isFalse();
          assertThat(registry.grants("approve", manager)).isTrue();
          assertThat(registry.grants("view", clerk)).as("unrestricted").isTrue();
          assertThat(registry.catalogFor(clerk).actions())
              .extracting(a -> a.id())
              .containsExactly("view");
          assertThat(registry.catalogFor(manager).actions()).hasSize(2);

          // a page naming both: the refused one is neither carried nor followed for the clerk
          var tree =
              Map.of("buttons", List.of(Map.of("actionId", "approve"), Map.of("actionId", "view")));
          assertThat(registry.referencedBy(tree, List.of(), java.util.Set.of(), clerk))
              .extracting(a -> a.id())
              .containsExactly("view");
          assertThat(registry.referencedBy(tree, List.of(), java.util.Set.of(), manager))
              .extracting(a -> a.id())
              .containsExactly("approve", "view");

          // dev mode: an edit drops the catalogue and the access it declared
          registry.invalidateSpecs();
          assertThat(registry.get("approve")).isPresent();
          return null;
        });
  }

  @Test
  void anUnrestrictedCatalogueIsShippedWholeToEveryone() {
    over(
        Map.of(
            "actions.yaml",
            "type: Actions\nactions:\n  - {id: a, steps: [{type: Emit, event: e}]}\n"),
        () -> {
          var registry = new ActionRegistry();
          assertThat(registry.restrictsAny()).isFalse();
          assertThat(registry.catalogFor(request("anyone"))).isSameAs(registry.catalog());
          return null;
        });
  }

  // ── field types ─────────────────────────────────────────────────────────────────────────────

  @Test
  void fieldTypesMayBeABareListAndAnEntryWithNoIdIsDropped() {
    var catalog =
        over(
            Map.of(
                "types.yaml",
                """
                - id: Money
                  dataType: money
                - label: anonymous type
                  dataType: string
                - id: Broken
                  dataType: noSuchDataType
                """),
            () -> new FieldTypeRegistry().catalog());
    assertThat(catalog.types()).extracting(t -> t.id()).containsExactly("Money");
  }

  @Test
  void aPartialFileGetsTheAppsFieldTypesToo() {
    var content =
        over(
            Map.of(
                "types.yaml",
                "type: Types\ntypes:\n  - {id: Email, label: E-mail, stereotype: email,"
                    + " required: true}\n",
                "partials/contact.yaml",
                """
                content:
                  - type: FormField
                    id: email
                    fieldType: Email
                  - type: Text
                    text: We never share it.
                """),
            () -> PartialRegistry.instance().resolve("contact", null));
    assertThat(content).hasSize(2);
    var email = (FormField) content.get(0);
    assertThat(email.label()).isEqualTo("E-mail");
    assertThat(email.required()).isTrue();
    assertThat(email.stereotype()).hasToString("email");
  }

  // ── partials ────────────────────────────────────────────────────────────────────────────────

  /** A partial authored in Java as a tree supplier: may answer differently per request. */
  public static class GreetingPartial implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new Text("Hello from code");
    }
  }

  /** A partial authored as a component class. */
  public static class FooterPartial implements Component {
    @Override
    public String cssClasses() {
      return "footer";
    }
  }

  /** Neither a component nor a supplier: not a partial. */
  public static class NotAPartial {}

  @Test
  void aPartialRefMayNameAJavaClass() {
    var registry = PartialRegistry.instance();
    assertThat(registry.resolve(GreetingPartial.class.getName(), null))
        .singleElement()
        .isInstanceOfSatisfying(Text.class, t -> assertThat(t.text()).isEqualTo("Hello from code"));
    assertThat(registry.resolve(FooterPartial.class.getName(), null))
        .singleElement()
        .isInstanceOf(FooterPartial.class);
    assertThat(registry.resolve(NotAPartial.class.getName(), null)).isEmpty();
    assertThat(registry.resolve("", null)).isEmpty();
    assertThat(registry.resolve(null, null)).isEmpty();
  }

  @Test
  void aDottedRefThatIsNoClassIsAPartialFileAndARegistrationWinsOverIt() {
    over(
        Map.of(
            "partials/footer.v2.yaml", "type: Text\ntext: v2 footer\n",
            "partials/note.yaml", "type: Text\ntext: from the file\n"),
        () -> {
          var registry = PartialRegistry.instance();
          assertThat(registry.resolve("specs/ui/partials/footer.v2.yaml", null))
              .singleElement()
              .isInstanceOfSatisfying(Text.class, t -> assertThat(t.text()).isEqualTo("v2 footer"));
          // dotted, not a class, no such file: nothing (and no exception)
          assertThat(registry.resolve("com.example.Missing", null)).isEmpty();
          registry.register("note", List.of(new Text("from code")));
          assertThat(registry.resolve("note", null))
              .singleElement()
              .isInstanceOfSatisfying(Text.class, t -> assertThat(t.text()).isEqualTo("from code"));
          return null;
        });
  }

  // ── environments ────────────────────────────────────────────────────────────────────────────

  @Test
  void environmentFilesAreFoundByTypeOrByTheirConventionalDirectory() {
    var names =
        over(
            Map.of(
                "environments/staging.yaml",
                "sources:\n  orders: {baseUrl: https://staging.example.test}\n",
                "deploy/prod-env.yaml",
                "type: Environment\nname: prod\nsources:\n  orders: {url: https://prod.example.test/o}\n",
                "deploy/qa.yaml",
                "type: Environment\nsources: {}\n",
                "deploy/not-an-environment.yaml",
                "sources:\n  orders: {url: https://nope.example.test}\n"),
            () -> Environments.names(Thread.currentThread().getContextClassLoader()));
    // named by `name:` or, failing that, by the file; untyped files outside environments/ are not
    assertThat(names).containsExactlyInAnyOrder("staging", "prod", "qa");
  }

  @Test
  void anOverrideRepointsTheUrlMergesHeadersAndMayFlipTheProxy() {
    var entry =
        new RestSourceEntry(
            "orders",
            RestDataSource.builder()
                .url("https://api.example.test/v1/orders?page=${page}")
                .headers(new LinkedHashMap<>(Map.of("Accept", "application/json")))
                .proxy(false)
                .build(),
            null,
            null,
            null,
            null,
            null,
            null);
    var noSource = new RestSourceEntry("bare", null, null, null, null, null, null, null);
    var catalog = new RestSourceCatalog(List.of(entry, noSource));

    var rebased =
        Environments.overlay(
            catalog,
            new Environment(
                "staging",
                Map.of(
                    "orders",
                    new Environment.SourceOverride(
                        "https://staging.example.test/",
                        null,
                        Map.of("X-Api-Key", "${secret.STAGING_KEY}"),
                        true),
                    "ghost",
                    new Environment.SourceOverride("https://ghost.example.test", null, null, null),
                    "bare",
                    new Environment.SourceOverride(
                        "https://bare.example.test", null, null, null))));
    var orders = rebased.get("orders").orElseThrow().source();
    assertThat(orders.url()).isEqualTo("https://staging.example.test/v1/orders?page=${page}");
    assertThat(orders.headers())
        .containsEntry("Accept", "application/json")
        .containsEntry("X-Api-Key", "${secret.STAGING_KEY}");
    assertThat(orders.proxy()).isTrue();
    // a source with no request of its own gets the base url as its whole url
    assertThat(rebased.get("bare").orElseThrow().source().url())
        .isEqualTo("https://bare.example.test");
    // an override for a source the catalogue does not declare adds nothing
    assertThat(rebased.get("ghost")).isEmpty();

    var replaced =
        Environments.overlay(
            catalog,
            new Environment(
                "prod",
                Map.of(
                    "orders",
                    new Environment.SourceOverride(
                        "https://ignored.example.test",
                        "https://prod.example.test/o",
                        null,
                        null))));
    var prod = replaced.get("orders").orElseThrow().source();
    assertThat(prod.url()).as("url wins over baseUrl").isEqualTo("https://prod.example.test/o");
    assertThat(prod.proxy()).as("no proxy override keeps the authored one").isFalse();

    assertThat(Environments.overlay(catalog, new Environment("empty", Map.of()))).isSameAs(catalog);
    assertThat(Environments.overlay(catalog, null)).isSameAs(catalog);
  }

  @Test
  void aRelativeUrlIsRebasedUnderTheEnvironmentsBase() {
    assertThat(Environments.rebase("api/orders", "https://h.test"))
        .isEqualTo("https://h.test/api/orders");
    assertThat(Environments.rebase("/api/orders", "https://h.test/"))
        .isEqualTo("https://h.test/api/orders");
    assertThat(Environments.rebase("https://old.test", "https://h.test"))
        .isEqualTo("https://h.test");
    assertThat(Environments.rebase(null, "https://h.test/")).isEqualTo("https://h.test");
  }

  @Test
  void theActiveEnvironmentIsReadFromTheSystemProperty() {
    var previous = System.getProperty(Environments.PROPERTY);
    try {
      System.setProperty(Environments.PROPERTY, "  staging ");
      assertThat(Environments.activeName()).isEqualTo("staging");
      var active =
          over(
              Map.of(
                  "environments/staging.yaml",
                  "sources:\n  orders: {baseUrl: https://staging.example.test}\n"),
              () -> Environments.active(Thread.currentThread().getContextClassLoader()));
      assertThat(active).get().extracting(Environment::name).isEqualTo("staging");
    } finally {
      if (previous == null) {
        System.clearProperty(Environments.PROPERTY);
      } else {
        System.setProperty(Environments.PROPERTY, previous);
      }
    }
  }

  // ── problems ────────────────────────────────────────────────────────────────────────────────

  @Test
  void aValueOfTheWrongShapeNamesTheTypeItShouldHaveBeen() {
    var yaml =
        """
        type: FormField
        id: amount
        dataType: number
        required: perhaps
        """;
    var mapper = YamlUidlMapperFactory.create();
    var error =
        org.assertj.core.api.Assertions.catchThrowable(
            () -> mapper.treeToValue(mapper.readTree(yaml), Component.class));
    var problem = YamlSpecProblems.describe("specs/ui/amount.yaml", yaml, error);
    assertThat(problem)
        .startsWith("specs/ui/amount.yaml, line 4 (required)")
        .contains("\"perhaps\"")
        .contains("answers \"Page not found\"");
  }

  private static HttpRequest request(String... roles) {
    return new io.mateu.core.testutil.FakeHttpRequest(
            io.mateu.dtos.RunActionRqDto.builder().route("/").build())
        .withPrincipal(io.mateu.core.testutil.TestIdentities.principalWithRoles(roles));
  }
}
