package io.mateu.uidl.interfaces;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The typed accessors an action method reads its request through — what {@code
 * getSelectedRows(Row.class)} or {@code getClickedRow(Row.class)} find in the payload is the whole
 * contract between a bulk action / row click on the client and the method on the server.
 */
class HttpRequestDefaultsTest {

  record Row(String id) {}

  /** Builds a {@link Row} from its state map, like the core's instance factory does. */
  @BeforeEach
  void factory() {
    MateuInstanceFactory.setInstanceFactory(
        new InstanceFactory() {
          @Override
          public <T> T newInstance(Class<T> type, HttpRequest httpRequest) {
            throw new UnsupportedOperationException();
          }

          @Override
          @SuppressWarnings("unchecked")
          public <T> T newInstance(
              Class<T> type, Map<String, Object> data, HttpRequest httpRequest) {
            return (T) new Row((String) data.get("id"));
          }
        });
  }

  @AfterEach
  void noFactory() {
    MateuInstanceFactory.setInstanceFactory(null);
  }

  @Test
  void theSelectionOfAListingArrivesAsTypedRows() {
    var rq =
        request(
            RunActionRqDto.builder()
                .componentState(
                    Map.of("crud_selected_items", List.of(Map.of("id", "a"), Map.of("id", "b"))))
                .build());

    assertThat(rq.getSelectedRows(Row.class)).containsExactly(new Row("a"), new Row("b"));
  }

  /** A bulk action bubbled up from the listing carries the selection in the initiator's state. */
  @Test
  void aBubbledActionReadsTheSelectionOfTheComponentThatStartedIt() {
    var rq =
        request(
            RunActionRqDto.builder()
                .componentState(Map.of())
                .parameters(
                    Map.of(
                        "initiatorState",
                        Map.of("crud_selected_items", List.of(Map.of("id", "x")))))
                .build());

    assertThat(rq.getSelectedRows(Row.class)).containsExactly(new Row("x"));
  }

  @Test
  void noSelectionIsAnEmptyList() {
    assertThat(
            request(RunActionRqDto.builder().componentState(Map.of()).build())
                .getSelectedRows(Row.class))
        .isEmpty();
    assertThat(
            request(
                    RunActionRqDto.builder()
                        .componentState(Map.of())
                        .parameters(Map.of("other", 1))
                        .build())
                .getSelectedRows(Row.class))
        .isEmpty();
  }

  @Test
  void aGridFieldsSelectionIsReadUnderItsOwnName() {
    var rq =
        request(
            RunActionRqDto.builder()
                .componentState(Map.of("guests_selected_items", List.of(Map.of("id", "g1"))))
                .build());

    assertThat(rq.getSelectedRows("guests", Row.class)).containsExactly(new Row("g1"));
    assertThat(rq.getSelectedRows("rooms", Row.class)).isEmpty();
  }

  @Test
  void theClickedRowIsTypedAndAbsentWhenNothingWasClicked() {
    var clicked =
        request(
            RunActionRqDto.builder()
                .componentState(Map.of())
                .parameters(Map.of("_clickedRow", Map.of("id", "r7")))
                .build());
    assertThat(clicked.getClickedRow(Row.class)).isEqualTo(new Row("r7"));

    var noRow =
        request(RunActionRqDto.builder().componentState(Map.of()).parameters(Map.of()).build());
    assertThat(noRow.getClickedRow(Row.class)).isNull();

    var noParameters = request(RunActionRqDto.builder().componentState(Map.of()).build());
    assertThat(noParameters.getClickedRow(Row.class)).isNull();
    assertThat(noParameters.getParameters(Row.class)).isNull();
  }

  @Test
  void parametersAreReadAsAMapOrAsATypedObject() {
    var rq =
        request(
            RunActionRqDto.builder()
                .componentState(Map.of())
                .parameters(Map.of("id", "p1"))
                .build());

    assertThat(rq.getParameters(Map.class)).containsEntry("id", "p1");
    assertThat(rq.getParameters(Row.class)).isEqualTo(new Row("p1"));
  }

  @Test
  void stateIsReadAsATypedObjectOrByKey() {
    var rq =
        request(
            RunActionRqDto.builder()
                .componentState(Map.of("id", "s1", "rows", List.of(Map.of("id", "a"))))
                .appState(Map.of("id", "app"))
                .build());

    assertThat(rq.getComponentState(Row.class)).isEqualTo(new Row("s1"));
    assertThat(rq.getAppState(Row.class)).isEqualTo(new Row("app"));
    assertThat(rq.getString("id")).isEqualTo("s1");
    assertThat(rq.getListOfMaps("rows")).containsExactly(Map.of("id", "a"));
    assertThat(rq.getListOfMaps("missing")).isEmpty();
  }

  /** An {@code @AppContext} picker left blank means "nothing selected", not an empty value. */
  @Test
  void anAppContextValueIsNullWhenBlankOrWhenThereIsNoAppState() {
    var state = new HashMap<String, Object>();
    state.put("hotel", "H1");
    state.put("company", " ");
    var rq = request(RunActionRqDto.builder().componentState(Map.of()).appState(state).build());

    assertThat(rq.appContext("hotel")).isEqualTo("H1");
    assertThat(rq.appContext("company")).isNull();
    assertThat(rq.appContext("year")).isNull();
    assertThat(request(RunActionRqDto.builder().build()).appContext("hotel")).isNull();
    assertThat(request(null).appContext("hotel")).isNull();
  }

  /** The adapters store the payload as an attribute, sometimes wrapped in an Optional. */
  @Test
  void thePayloadsAreStoredAndReadBackThroughTheAttributes() {
    var rq = new MapRequest(null);
    var action = RunActionRqDto.builder().actionId("save").build();
    var ui = new GetUIRqDto(Map.of("k", "v"), "");

    assertThat(rq.storeRunActionRqDto(action).storeGetUIRqDto(ui)).isSameAs(rq);
    assertThat(rq.runActionRq()).isSameAs(action);
    assertThat(rq.getUiRq()).isSameAs(ui);

    rq.setAttribute("payload_run_action_rq", Optional.of(action));
    rq.setAttribute("payload_get_ui_rq", Optional.of(ui));
    assertThat(rq.runActionRq()).isSameAs(action);
    assertThat(rq.getUiRq()).isSameAs(ui);

    rq.setAttribute("baseUrl", "/app");
    rq.setAttribute("uriPrefix", "/ui");
    assertThat(rq.getBaseUrl()).isEqualTo("/app");
    assertThat(rq.getUriPrefix()).isEqualTo("/ui");
    assertThat(rq.getSelfBaseUrl()).isNull();
    assertThat(rq.getUserPrincipal()).isNull();
  }

  @Test
  void theLastTwoPathItemsAreTheRecordAndItsCollection() {
    var rq = new MapRequest(null);
    rq.path = "/app/orders/42";

    assertThat(rq.lastPathItem()).isEqualTo("42");
    assertThat(rq.penultimatePathItem()).isEqualTo("orders");
  }

  private static HttpRequest request(RunActionRqDto rq) {
    return new MapRequest(rq);
  }

  /** An adapter's request reduced to its attributes. */
  static class MapRequest implements HttpRequest {
    final Map<String, Object> attributes = new HashMap<>();
    String path = "";

    MapRequest(RunActionRqDto rq) {
      if (rq != null) {
        storeRunActionRqDto(rq);
      }
    }

    @Override
    public String getParameterValue(String name) {
      return null;
    }

    @Override
    public List<String> getParameterValues(String name) {
      return List.of();
    }

    @Override
    public Object getAttribute(String key) {
      return attributes.get(key);
    }

    @Override
    public void setAttribute(String key, Object value) {
      attributes.put(key, value);
    }

    @Override
    public String getHeaderValue(String key) {
      return null;
    }

    @Override
    public List<String> getHeaderValues(String key) {
      return List.of();
    }

    @Override
    public String path() {
      return path;
    }

    @Override
    public List<String> getParameterNames() {
      return List.of();
    }
  }
}
