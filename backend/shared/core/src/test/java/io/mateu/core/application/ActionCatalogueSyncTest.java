package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.export.MateuBundleExporter.BundleManifest;
import io.mateu.core.application.runaction.ActionRegistry;
import io.mateu.core.domain.out.fragmentmapper.mappers.ActionCatalogMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RouteTable;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Step;
import io.mateu.uidl.interfaces.ActionCatalogSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

/**
 * The shared ACTION catalogue ({@code specs/ui/actions.yaml} + any {@code type: Actions} file +
 * {@link ActionCatalogSupplier} beans): named client-runnable actions defined once and run by id
 * from the shell menu and any page — OWNER FIRST, then the catalogue, then a server action.
 *
 * <p>Fixtures live under {@code mount-home/action-catalogue} and are read through a dedicated
 * classloader overlay, so the shared {@code specs/ui} of the core test classpath is untouched.
 */
class ActionCatalogueSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

  private static <T> T over(Supplier<T> body) {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(
        new MountHomeSyncTest.SpecsOverlay(
            "action-catalogue", ActionCatalogueSyncTest.class.getClassLoader()));
    try {
      return body.get();
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  private static UIIncrementDto load(String route, List<Object> beans, Class<?>... uis) {
    return over(
        () -> {
          try (var mateu = TestMateu.withUisAndBeans(beans, uis)) {
            return mateu.run(
                RunActionRqDto.builder()
                    .route(route)
                    .consumedRoute("/".equals(route) ? "_empty" : "")
                    .actionId("")
                    .build());
          }
        });
  }

  private static AppDto appOf(UIIncrementDto increment) {
    var component = (ClientSideComponentDto) increment.fragments().get(0).component();
    return (AppDto) component.metadata();
  }

  private static ActionDto byId(List<ActionDto> actions, String id) {
    return actions.stream().filter(a -> id.equals(a.id())).findFirst().orElseThrow();
  }

  @Test
  void theCatalogueIsReadFromActionsYamlAndEveryTypeActionsFile() {
    var catalog = over(() -> new ActionRegistry().catalog());
    assertThat(catalog.actions())
        .extracting(Action::id)
        .containsExactly("newOrder", "refreshCustomers", "refresh", "chained", "fromOtherFile");
    assertThat(catalog.get("newOrder").orElseThrow().description()).isEqualTo("Start a new order");
    assertThat(catalog.get("refreshCustomers").orElseThrow().restAction()).isNotNull();
  }

  @Test
  void anEntryThatIsNotClientRunnableIsRejectedWithAWarning() {
    var logger = (Logger) LoggerFactory.getLogger(ActionRegistry.class);
    var appender = new ListAppender<ILoggingEvent>();
    appender.start();
    logger.addAppender(appender);
    try {
      var catalog = over(() -> new ActionRegistry().catalog());
      assertThat(catalog.get("serverOnly")).isEmpty();
      assertThat(appender.list)
          .anySatisfy(
              event -> {
                assertThat(event.getLevel()).isEqualTo(Level.WARN);
                assertThat(event.getFormattedMessage())
                    .contains("serverOnly")
                    .contains("not client-runnable");
              });
    } finally {
      logger.detachAppender(appender);
    }
  }

  @Test
  void theWireAppCarriesTheCatalogueLoweredToCommands() {
    var app = appOf(load("/", List.of()));
    assertThat(app.actionCatalogue())
        .extracting(ActionDto::id)
        .containsExactly("newOrder", "refreshCustomers", "refresh", "chained", "fromOtherFile");
    var newOrder = byId(app.actionCatalogue(), "newOrder");
    assertThat(newOrder.commands())
        .extracting(c -> c.type())
        .containsExactly(UICommandTypeDto.MarkAsClean, UICommandTypeDto.NavigateTo);
    assertThat(newOrder.commands().get(1).data()).isEqualTo("orders/new");
    assertThat(byId(app.actionCatalogue(), "refreshCustomers").restAction().source().url())
        .isEqualTo("https://example.test/api/customers");
  }

  @Test
  void theShellMenuNamesACatalogueIdItDoesNotDeclare() {
    var app = appOf(load("/", List.of()));
    // the shell carries only its OWN flows; the leaf's id resolves against the catalogue
    assertThat(app.actions()).extracting(ActionDto::id).containsExactly("announce");
    var leaf =
        app.menu().stream().filter(o -> "New order".equals(o.label())).findFirst().orElseThrow();
    assertThat(leaf.rules().get(0).actionId()).isEqualTo("newOrder");
    assertThat(app.actionCatalogue()).extracting(ActionDto::id).contains("newOrder");
  }

  private static ServerSideComponentDto page(UIIncrementDto increment) {
    return increment.fragments().stream()
        .map(f -> f.component())
        .filter(ServerSideComponentDto.class::isInstance)
        .map(ServerSideComponentDto.class::cast)
        .findFirst()
        .orElseThrow();
  }

  @Test
  void aPageResolvesACatalogueIdAndItsOwnActionWins() {
    var page = page(load("/orders", List.of()));
    // the catalogue entry the button names travels with the page, lowered
    var newOrder = byId(page.actions(), "newOrder");
    assertThat(newOrder.commands())
        .extracting(c -> c.type())
        .containsExactly(UICommandTypeDto.MarkAsClean, UICommandTypeDto.NavigateTo);
    // OWNER FIRST: the page's own `refresh` replaces the catalogue's
    var refresh = page.actions().stream().filter(a -> "refresh".equals(a.id())).toList();
    assertThat(refresh).hasSize(1);
    assertThat(String.valueOf(refresh.get(0).commands().get(0).data())).contains("page-refresh");
    // a catalogue flow running another entry brings that one along (once)
    assertThat(page.actions()).extracting(ActionDto::id).containsOnlyOnce("chained", "newOrder");
    // an entry nobody references stays in the catalogue
    assertThat(page.actions()).extracting(ActionDto::id).doesNotContain("fromOtherFile");
  }

  /** A Java page whose tree names a catalogue id and one it handles itself. */
  @UI("/java-catalogue-page")
  public static class JavaPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new io.mateu.uidl.data.VerticalLayout(
          List.of(
              Button.builder().label("New").actionId("newOrder").build(),
              Button.builder().label("Refresh").actionId("refresh").build()));
    }

    public void refresh() {}
  }

  @Test
  void aJavaPageResolvesTheCatalogueAfterItsOwnMethods() {
    var page = page(load("/java-catalogue-page", List.of(), JavaPage.class));
    assertThat(byId(page.actions(), "newOrder").commands()).isNotEmpty();
    var refresh = byId(page.actions(), "refresh");
    assertThat(refresh.commands()).as("the view's own method wins").isNull();
  }

  @Test
  void anAuthoredEntryReplacesASuppliedOneOfTheSameId() {
    ActionCatalogSupplier supplier =
        () ->
            List.of(
                Action.builder()
                    .id("newOrder")
                    .steps(List.of(new Step.Navigate("elsewhere")))
                    .build(),
                Action.builder().id("supplied").steps(List.of(new Step.Navigate("home"))).build(),
                Action.builder().id("notRunnable").build());
    var app = appOf(load("/", List.of(supplier)));
    assertThat(app.actionCatalogue()).extracting(ActionDto::id).contains("supplied");
    assertThat(app.actionCatalogue()).extracting(ActionDto::id).doesNotContain("notRunnable");
    assertThat(byId(app.actionCatalogue(), "newOrder").commands().get(1).data())
        .as("authored wins")
        .isEqualTo("orders/new");
  }

  @Test
  void theBundleManifestShipsTheCatalogueOnceAndRoundTrips() throws Exception {
    var actions = over(() -> ActionCatalogMapper.map(new ActionRegistry().catalog()));
    var manifest =
        new BundleManifest(
            "",
            "now",
            true,
            List.of(),
            RouteTable.empty(),
            RestSourceCatalog.empty(),
            List.of(),
            Map.of(),
            actions);
    var json = JSON.writeValueAsString(manifest);
    var back = JSON.readValue(json, BundleManifest.class);
    assertThat(back.actions())
        .extracting(ActionDto::id)
        .containsExactlyElementsOf(actions.stream().map(ActionDto::id).toList());
    assertThat(back.actions().get(0).commands().get(1).type())
        .isEqualTo(UICommandTypeDto.NavigateTo);
    // the catalogue does not change what the bundle CONTAINS: same screens, same hash
    var without =
        new BundleManifest(
            "",
            "now",
            true,
            List.of(),
            RouteTable.empty(),
            RestSourceCatalog.empty(),
            List.of(),
            Map.of());
    assertThat(manifest.structureHash()).isEqualTo(without.structureHash());
    assertThat(JSON.readTree(json).has("actions")).isTrue();
  }

  /**
   * The Java golden of the browser side ({@code actionCatalogue.test.ts}): the shell and the orders
   * page as the server sends them. Run with {@code -Dmateu.golden.write=true} to refresh it.
   */
  @Test
  void writesTheGoldenForTheBrowserExpander() throws Exception {
    var shell = load("/", List.of());
    var orders = load("/orders", List.of());
    assertThat(appOf(shell).actionCatalogue()).isNotEmpty();
    if (!Boolean.getBoolean("mateu.golden.write")) return;
    var tree = JSON.createObjectNode();
    tree.set("shell", JSON.valueToTree(shell));
    tree.set("orders", JSON.valueToTree(orders));
    java.nio.file.Files.writeString(
        java.nio.file.Path.of(
            "../../../frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/expander/__fixtures__/action-catalogue.golden.json"),
        JSON.writerWithDefaultPrettyPrinter().writeValueAsString(tree));
  }
}
