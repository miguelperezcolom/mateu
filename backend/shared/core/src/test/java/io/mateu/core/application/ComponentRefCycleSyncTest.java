package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.runaction.PartialRegistry;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ComponentEntry;
import io.mateu.uidl.data.ComponentRef;
import io.mateu.uidl.data.Partial;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentCatalogSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A business component whose composition references itself — directly, through another component or
 * through a partial — used to recurse in {@code ComponentToFragmentDtoMapper} until a {@code
 * StackOverflowError} (external review, 2026-10-18), both for the page and for the catalogue the
 * app ships on its metadata. The cycle is broken where it closes, with the same placeholder an
 * unknown name gets, and the rest of the page renders.
 */
class ComponentRefCycleSyncTest {

  public static class CyclicCatalogue implements ComponentCatalogSupplier {
    @Override
    public List<ComponentEntry> businessComponents() {
      return List.of(
          new ComponentEntry(
              "Loop", new VerticalLayout(new Text("loop body"), new ComponentRef("Loop"))),
          new ComponentEntry(
              "PingA", new VerticalLayout(new Text("ping a"), new ComponentRef("PingB"))),
          new ComponentEntry(
              "PingB", new VerticalLayout(new Text("ping b"), new ComponentRef("PingA"))),
          new ComponentEntry("Branded", new VerticalLayout(new Partial("cycle-brand"))),
          new ComponentEntry("Price", new Text("the price")));
    }
  }

  @UI("/cycle-direct")
  public static class DirectPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(new ComponentRef("Loop"), new ComponentRef("Price"));
    }
  }

  @UI("/cycle-indirect")
  public static class IndirectPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(new ComponentRef("PingA"));
    }
  }

  @UI("/cycle-mixed")
  public static class MixedPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(new Partial("cycle-brand"), new ComponentRef("Price"));
    }
  }

  @UI("/cycle-app")
  public static class CycleApp {
    @io.mateu.uidl.annotations.Menu String home = "/cycle-direct";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    // the partial a business component uses, which uses the component back
    PartialRegistry.instance()
        .register("cycle-brand", List.of(new Text("brand"), new ComponentRef("Branded")));
    mateu =
        TestMateu.withUisAndBeans(
            List.of(new CyclicCatalogue()),
            DirectPage.class,
            IndirectPage.class,
            MixedPage.class,
            CycleApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
    PartialRegistry.instance().reset();
  }

  private static String wire(String route) throws Exception {
    return new ObjectMapper().writeValueAsString(mateu.sync(route));
  }

  @Test
  void aSelfReferencingComponentRendersOnceAndTheRestOfThePageToo() throws Exception {
    var json = wire("/cycle-direct");
    assertThat(json).contains("loop body").contains("the price");
    assertThat(json).contains("Unknown business component: Loop");
    assertThat(json.split("loop body", -1)).hasSize(2);
  }

  @Test
  void anIndirectCycleIsBrokenWhereItCloses() throws Exception {
    var json = wire("/cycle-indirect");
    assertThat(json).contains("ping a").contains("ping b");
    assertThat(json).contains("Unknown business component: PingA");
  }

  @Test
  void aMixedCycleThroughAPartialIsBroken() throws Exception {
    var json = wire("/cycle-mixed");
    // the partial inside the business component is expanded too (it used to stay unexpanded)
    assertThat(json).contains("brand").contains("the price");
    assertThat(json).contains("Unknown business component: Branded");
    assertThat(json).doesNotContain("\"type\":\"Partial\"");
  }

  @Test
  void theShippedCatalogueSurvivesCyclicEntries() throws Exception {
    var json = wire("/cycle-app");
    assertThat(json).contains("\"name\":\"Loop\"").contains("\"name\":\"Price\"");
  }
}
