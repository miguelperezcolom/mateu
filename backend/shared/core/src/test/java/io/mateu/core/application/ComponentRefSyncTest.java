package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ComponentRef;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A business-component reference resolves server-side (coherence-plan #13): a {@code
 * ComponentRef("AgencySelector")} in a page's tree is substituted by the catalogue entry's
 * composition before rendering, so a backend-driven app never ships the reference. The catalogue is
 * the authored {@code specs/ui/components.yaml} on the test classpath (AgencySelector → a Text).
 */
class ComponentRefSyncTest {

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

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BizRefPage.class, BizRefUnknownPage.class);
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
}
