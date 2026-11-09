package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import io.mateu.uidl.interfaces.StateSupplier;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A view model behind a YAML layout (a route binding {@code layout:} + {@code viewModel:}) that
 * implements {@link StateSupplier}: the state it supplies is what the page carries — exactly as for
 * a reflected page. It used to be ignored: the YAML branch sent the raw instance as the state.
 */
class YamlLayoutStateSupplierSyncTest {

  public static class StatedView implements StateSupplier {
    public String greeting = "from the field";

    @Override
    public Object state(HttpRequest httpRequest) {
      return Map.of("greeting", "from state()");
    }
  }

  public static class Routes implements RouteEntrySupplier {
    @Override
    public List<RouteEntry> routes() {
      return List.of(
          RouteEntry.builder()
              .route("stated-page")
              .definition("stated-layout.yaml")
              .viewModel(StatedView.class.getName())
              .build());
    }
  }

  private TestMateu mateu;

  @BeforeEach
  void setUp() {
    mateu = TestMateu.withUisAndBeans(List.of(new Routes()), StatedView.class);
  }

  @AfterEach
  void tearDown() {
    mateu.close();
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> state(UIIncrementDto increment) {
    return (Map<String, Object>)
        new com.fasterxml.jackson.databind.ObjectMapper()
            .convertValue(increment.fragments().get(0).state(), Map.class);
  }

  @Test
  void theStateTheViewModelSuppliesIsThePagesState() {
    var increment = mateu.sync("stated-page");
    assertThat(increment.fragments()).isNotEmpty();
    assertThat(state(increment)).containsEntry("greeting", "from state()");
  }
}
