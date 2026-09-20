package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ComponentEntry;
import io.mateu.uidl.data.ComponentRef;
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
 * A business-component reference resolves server-side (coherence-plan #13): a {@code
 * ComponentRef("AgencySelector")} in a page's tree is substituted by the catalogue entry's
 * composition before rendering, so a backend-driven app never ships the reference. The catalogue is
 * contributed by a {@link ComponentCatalogSupplier} bean (the programmatic producer) — kept off the
 * shared test classpath so it does not leak into the cross-language conformance corpus.
 */
class ComponentRefSyncTest {

  /** The programmatic catalogue for this test: names AgencySelector → a Text. */
  public static class TestCatalogue implements ComponentCatalogSupplier {
    @Override
    public List<ComponentEntry> businessComponents() {
      return List.of(new ComponentEntry("AgencySelector", new Text("agency selector")));
    }
  }

  @UI("/biz-ref")
  public static class BizRefPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(new ComponentRef("AgencySelector"));
    }
  }

  @UI("/biz-ref-unknown")
  public static class BizRefUnknownPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(new ComponentRef("Nope"));
    }
  }

  @UI("/biz-app")
  public static class BizApp {
    @io.mateu.uidl.annotations.Menu String home = "/biz-ref";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUisAndBeans(
            List.of(new TestCatalogue()), BizRefPage.class, BizRefUnknownPage.class, BizApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static String wire(String route) throws Exception {
    return new ObjectMapper().writeValueAsString(mateu.sync(route));
  }

  @Test
  void aReferenceIsSubstitutedByTheCatalogueComposition() throws Exception {
    var json = wire("/biz-ref");
    // The AgencySelector composition (a Text "agency selector") appears...
    assertThat(json).contains("agency selector");
    // ...and the reference itself never reaches the wire — the server resolved it. (Check the wire
    // TYPE discriminator, not the bare word: the test class name also contains "ComponentRef".)
    assertThat(json).doesNotContain("\"type\":\"ComponentRef\"");
  }

  @Test
  void anUnknownReferenceIsAGracefulPlaceholderNotAnError() throws Exception {
    var json = wire("/biz-ref-unknown");
    assertThat(json).contains("Unknown business component: Nope");
    assertThat(json).doesNotContain("\"type\":\"ComponentRef\"");
  }

  @Test
  void theAppShipsTheComponentCatalogueOnItsMetadata() throws Exception {
    // AppDto.components carries the catalogue (name → resolved composition) so a ComponentRef can
    // be
    // resolved by the renderer or the client-side expander with no backend.
    var json = wire("/biz-app");
    assertThat(json).contains("\"components\"");
    assertThat(json).contains("\"name\":\"AgencySelector\"");
    assertThat(json).contains("agency selector");
  }
}
