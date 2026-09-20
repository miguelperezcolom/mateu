package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CustomComponent;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A custom component (coherence-plan #14) reaches the wire as a {@code CustomComponent} metadata
 * carrying its type {@code name} + {@code props}, with slotted {@code content} as ordinary
 * children. The rendering is per-renderer (a renderer registers against the name, else {@code
 * <mateu-unsupported>}), but the WIRE is data and identical across backends — this pins the Java
 * leg.
 */
class CustomComponentSyncTest {

  @UI("/custom-component")
  public static class CustomComponentPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return CustomComponent.builder()
          .name("org-chart")
          .props(Map.of("orientation", "vertical", "levels", 3))
          .content(List.of(new Text("fallback content")))
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(CustomComponentPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aCustomComponentCarriesNamePropsAndSlottedChildrenOnTheWire() throws Exception {
    var json = new ObjectMapper().writeValueAsString(mateu.sync("/custom-component"));
    assertThat(json).contains("\"type\":\"CustomComponent\"");
    assertThat(json).contains("\"name\":\"org-chart\"");
    assertThat(json).contains("\"orientation\":\"vertical\"");
    // slotted content travels as ordinary children, paintable by any renderer
    assertThat(json).contains("fallback content");
  }
}
