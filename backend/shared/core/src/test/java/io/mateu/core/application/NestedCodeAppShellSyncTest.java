package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A view that returns a fluent {@link AppShell} as its component tree, at a route below the root of
 * the app (here under a root {@code @UI("")} page): its menu routes are relative to it, and the
 * content loads its slot sends answer its pages. It used to draw its chrome and answer "Not found"
 * to every content load, which the client re-sent until the request-loop guard tripped.
 */
class NestedCodeAppShellSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @UI("")
  @Title("Root page")
  public static class RootPage {
    public String note = "the root";
  }

  @UI("/museum-code")
  public static class MuseumShell implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return AppShell.builder()
          .title("City Museum in code")
          .homeRoute("collection")
          .menu(
              List.of(
                  RouteLink.builder().label("Collection").route("collection").build(),
                  RouteLink.builder().label("Visitors").route("visitors").build()))
          .build();
    }
  }

  @UI("/museum-code/collection")
  @Title("Collection page")
  public static class CollectionPage {
    public String what = "the collection";
  }

  @UI("/museum-code/visitors")
  @Title("Visitors page")
  public static class VisitorsPage {
    public String what = "the visitors";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            RootPage.class, MuseumShell.class, CollectionPage.class, VisitorsPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static JsonNode appOf(JsonNode wire) {
    return wire.findParents("type").stream()
        .filter(node -> "App".equals(node.path("type").asText()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no App in " + wire));
  }

  private static JsonNode content(String route, String serverSideType) {
    try {
      var rq =
          RunActionRqDto.builder()
              .route(route)
              .consumedRoute("/museum-code")
              .serverSideType(serverSideType)
              .actionId("")
              .initiatorComponentId("ux_root")
              .build();
      return JSON.valueToTree(
          mateu
              .service()
              .runAction("", rq, "", new FakeHttpRequest(rq).withAttribute("baseUrl", ""))
              .blockFirst());
    } catch (Throwable t) {
      throw new AssertionError(t);
    }
  }

  @Test
  void theShellsMenuIsRelativeToIt() {
    var app = appOf(JSON.valueToTree(mateu.sync("/museum-code")));
    System.out.println("CODESHELL " + app);
    assertThat(app.findValues("route").stream().map(JsonNode::asText))
        .contains("/museum-code/collection", "/museum-code/visitors");
  }

  @Test
  void theShellsContentLoadsAnswerItsPages() {
    var app = appOf(JSON.valueToTree(mateu.sync("/museum-code")));
    var type = app.path("serverSideType").isNull() ? null : app.path("serverSideType").asText();
    var collection = content("/museum-code/collection", type).toString();
    System.out.println("CODECONTENT " + collection);
    assertThat(collection).contains("Collection page").doesNotContain("Not found");
  }
}
