package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Text;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A page made only of components — a MicroFrontend field among them — is not a form, and its fields
 * were mapped bare: an {@code @Label} on them was silently dropped (found building the Mateu
 * Explorer's distributed area, 3.0-beta.51). A labelled component field now carries its label; an
 * unlabelled one keeps the bare shape it always had.
 */
class MicroFrontendFieldLabelSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @UI("/mf-label")
  public static class RemoteStockPage {
    @Label("Stock from the inventory service")
    MicroFrontend stock =
        MicroFrontend.builder()
            .baseUrl("http://remote.example/inventory")
            .route("/stock")
            .consumedRoute("")
            .build();

    Text note = new Text("unlabelled-note", "A note without a label");
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RemoteStockPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aLabelledMicroFrontendFieldShowsItsLabel() {
    var wire = JSON.valueToTree(mateu.sync("/mf-label")).toString();
    assertThat(wire).contains("\"type\":\"MicroFrontend\"");
    assertThat(wire).contains("Stock from the inventory service");
  }

  @Test
  void anUnlabelledComponentFieldKeepsItsBareShape() {
    var wire = JSON.valueToTree(mateu.sync("/mf-label")).toString();
    assertThat(wire).contains("A note without a label");
    // no caption is made up for it (its humanized field name)
    assertThat(wire).doesNotContain("\"label\":\"Note\"");
  }
}
