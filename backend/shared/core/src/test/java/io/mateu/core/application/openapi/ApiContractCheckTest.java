package io.mateu.core.application.openapi;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.UI;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The derived spec used as a CHECK rather than as a file.
 *
 * <p>Emitting is useful; verifying is where the value is — and the reason is the direction of the
 * drift it catches. Code generation only protects you while nobody edits the generated code. A
 * check catches the server changing a response the screens read <b>and</b> the screens starting to
 * need something the server does not offer, which is the failure that otherwise reaches production
 * as an empty select nobody can explain.
 */
class ApiContractCheckTest {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  @SuppressWarnings("unused")
  @UI("/orders")
  @RestListing(url = "https://api.example.com/orders?since=${state.since}", itemsPath = "data")
  public static class Orders {}

  private static com.fasterxml.jackson.databind.JsonNode required() {
    return OpenApiEmitter.emit("UI needs", List.of(Orders.class));
  }

  private static com.fasterxml.jackson.databind.JsonNode offered(String json) throws Exception {
    return MAPPER.readTree(json);
  }

  @Test
  void anApiThatSatisfiesTheScreensHasNoGaps() throws Exception {
    var api =
        offered(
            """
            {"paths": {"/orders": {"get": {"parameters": [{"name": "since"}]}}}}
            """);
    assertThat(ApiContractCheck.check(required(), api)).isEmpty();
  }

  @Test
  void aMissingPathIsReported() throws Exception {
    assertThat(ApiContractCheck.check(required(), offered("{\"paths\": {}}")))
        .extracting(Object::toString)
        .containsExactly("GET /orders — the API does not declare this path");
  }

  @Test
  void aPathWithoutTheDeclaredMethodIsReported() throws Exception {
    var api = offered("{\"paths\": {\"/orders\": {\"post\": {}}}}");
    assertThat(ApiContractCheck.check(required(), api))
        .extracting(Object::toString)
        .containsExactly("GET /orders — the API declares the path but not this method");
  }

  @Test
  void aParameterTheScreensSendAndTheApiIgnoresIsReported() throws Exception {
    // The quiet one: the endpoint exists and answers 200, but ignores the filter the screen sends,
    // so the user sees the wrong rows and nothing errors.
    var api = offered("{\"paths\": {\"/orders\": {\"get\": {\"parameters\": []}}}}");
    assertThat(ApiContractCheck.check(required(), api))
        .extracting(Object::toString)
        .containsExactly("GET /orders — the screens send 'since' and the API does not accept it");
  }

  @Test
  void theCheckIsSilentAboutWhatTheUiCannotKnow() throws Exception {
    // An API with error codes, auth and schemas the UI never declared is NOT a gap. A check that
    // complained about those would be reporting noise, and a noisy check gets ignored.
    var api =
        offered(
            """
            {"paths": {"/orders": {"get": {
              "parameters": [{"name": "since"}],
              "security": [{"bearer": []}],
              "responses": {"200": {}, "404": {}, "500": {}}
            }}}}
            """);
    assertThat(ApiContractCheck.check(required(), api)).isEmpty();
  }
}
