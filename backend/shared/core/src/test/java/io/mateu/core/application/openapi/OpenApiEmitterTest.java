package io.mateu.core.application.openapi;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.RestData;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The OpenAPI a UI implies.
 *
 * <p>The point of these tests is not that a document comes out — it is that the document says what
 * the screens actually declared, and <b>only</b> that. A derived spec that quietly invented an
 * error code or a security scheme would be worse than none: it would look authoritative about
 * things the UI cannot know.
 */
class OpenApiEmitterTest {

  @SuppressWarnings("unused")
  @UI("/orders")
  @Title("Orders")
  @RestListing(url = "https://api.example.com/orders?since=${state.since}", itemsPath = "data")
  public static class Orders {

    @RestOptions(
        url = "https://api.example.com/countries",
        itemsPath = "items",
        valuePath = "code",
        labelPath = "name")
    public String country;

    @RestAction(url = "https://api.example.com/orders/${state.id}/approve", method = "POST")
    public void approve() {}
  }

  @SuppressWarnings("unused")
  @UI("/dashboard")
  @Title("Dashboard")
  @RestData(url = "https://metrics.example.com/summary", resultPath = "result")
  public static class Dashboard {}

  private static com.fasterxml.jackson.databind.JsonNode doc() {
    return OpenApiEmitter.emit("Test API", List.of(Orders.class, Dashboard.class));
  }

  @Test
  void everyDeclaredEndpointBecomesAPath() {
    var paths = doc().get("paths");
    assertThat(paths.fieldNames())
        .toIterable()
        .contains("/orders", "/countries", "/orders/_/approve", "/summary");
  }

  @Test
  void theMethodComesFromTheDeclaration() {
    assertThat(doc().get("paths").get("/orders/_/approve").has("post")).isTrue();
    assertThat(doc().get("paths").get("/countries").has("get")).isTrue();
  }

  @Test
  void distinctOriginsBecomeServers() {
    var servers = doc().get("servers");
    assertThat(servers).hasSize(2);
    assertThat(servers.toString())
        .contains("https://api.example.com")
        .contains("https://metrics.example.com");
  }

  @Test
  void interpolatedValuesBecomeRequiredParameters() {
    // The screen WILL substitute them, so an endpoint that ignores them cannot answer correctly.
    var parameters = doc().get("paths").get("/orders").get("get").get("parameters");
    assertThat(parameters).hasSize(1);
    assertThat(parameters.get(0).get("name").asText()).isEqualTo("since");
    assertThat(parameters.get(0).get("required").asBoolean()).isTrue();
  }

  @Test
  void theShapeTheScreenReadsIsRecorded() {
    // itemsPath/resultPath are the only thing the UI knows about the response body, and it is worth
    // stating: it is what an implementer has to put there.
    assertThat(doc().get("paths").get("/orders").get("get").get("description").asText())
        .contains("`data`");
    assertThat(doc().get("paths").get("/summary").get("get").get("description").asText())
        .contains("`result`");
  }

  @Test
  void theDocumentSaysWhatItCannotKnow() {
    // The honesty clause, pinned: this is a lower bound, and the document must say so rather than
    // let a reader assume error codes or auth were considered.
    assertThat(doc().get("info").get("description").asText())
        .contains("MINIMUM")
        .contains("cannot carry error codes");
  }

  @Test
  void placeholdersAreReadOffBothUrlAndBody() {
    assertThat(OpenApiEmitter.placeholders("/x/${state.id}", "{\"n\": \"${state.name}\"}"))
        .containsExactly("id", "name");
  }

  @Test
  void aRelativeUrlYieldsNoServerButStillAPath() {
    // Same-origin endpoints are declared relative; they must not invent a server entry.
    assertThat(OpenApiEmitter.origin("/api/local")).isNull();
    assertThat(OpenApiEmitter.path("/api/local")).isEqualTo("/api/local");
  }
}
