package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ComponentEntry;
import io.mateu.uidl.data.ComponentRef;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentCatalogSupplier;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Using a business component in a REFLECTED page (coherence-plan #13): a {@code Component}-typed
 * field whose value is a {@code ComponentRef} renders as the catalogue's composition — no
 * annotation needed, the component-holder field path + the server-side reference resolution do it.
 * This is the ergonomic "reference a business component by name" usage; {@link
 * ComponentRefSyncTest} covers the fluent component-tree case.
 */
class BusinessComponentFieldSyncTest {

  public static class Catalogue implements ComponentCatalogSupplier {
    @Override
    public List<ComponentEntry> businessComponents() {
      return List.of(new ComponentEntry("AgencySelector", new Text("agency selector")));
    }
  }

  @UI("/agency-form")
  public static class AgencyForm {
    // A business component referenced by name; resolves to the catalogue's composition on render.
    public Component agency = new ComponentRef("AgencySelector");
    public String note = "x";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new Catalogue()), AgencyForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aComponentRefFieldRendersAsTheCatalogueComposition() throws Exception {
    var json = new ObjectMapper().writeValueAsString(mateu.sync("/agency-form"));
    assertThat(json).contains("agency selector");
    // resolved server-side — the reference type never reaches the wire
    assertThat(json).doesNotContain("\"type\":\"ComponentRef\"");
    // the plain field still renders alongside it
    assertThat(json).contains("\"fieldId\":\"note\"");
  }
}
