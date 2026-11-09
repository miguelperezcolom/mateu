package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A route authored with a definition and NO view model, under a root {@code @UI("")} app CLASS (the
 * Mateu Explorer's shape: a class shell with a {@link MenuSupplier}, its routes supplied in code).
 * Opened directly in the browser, the fresh load answers the shell and the shell then loads the
 * content NAMING ITS OWN TYPE — that second request answered "Page not found", because the
 * known-type path only looked for routed CLASSES after the menu, never for the definition. The same
 * content embedded in another page (a load with no type) rendered.
 */
class DefinitionOnlyDeepLinkUnderClassShellSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @UI("")
  @io.mateu.uidl.annotations.App(io.mateu.uidl.fluent.AppVariant.HAMBURGER_SECTIONS)
  public static class Shell implements MenuSupplier {
    @Override
    public List<Actionable> menu(HttpRequest httpRequest) {
      return List.of(new RouteLink("home", "Home"));
    }
  }

  public static class Home {
    public String greeting = "home page";
  }

  public static class Routes implements RouteEntrySupplier {
    @Override
    public List<RouteEntry> routes() {
      return List.of(
          RouteEntry.builder().route("home").viewModel(Home.class.getName()).build(),
          RouteEntry.builder().route("x/static-page").definition("about.yaml").build());
    }
  }

  private TestMateu mateu;

  @BeforeEach
  void setUp() {
    mateu = TestMateu.withUisAndBeans(List.of(new Routes()), Shell.class, Home.class);
  }

  @AfterEach
  void tearDown() {
    mateu.close();
  }

  private String wire(RunActionRqDto rq) {
    return JSON.valueToTree(mateu.run(rq)).toString();
  }

  @Test
  void theFreshDeepLinkAnswersTheShell() {
    var wire =
        wire(
            RunActionRqDto.builder()
                .route("/x/static-page")
                .consumedRoute("_empty")
                .actionId("")
                .componentState(Map.of())
                .build());
    assertThat(wire).contains(Shell.class.getName());
  }

  @Test
  void theShellsContentLoadOfTheDefinitionRendersIt() {
    var wire =
        wire(
            RunActionRqDto.builder()
                .route("/x/static-page")
                .consumedRoute("")
                .serverSideType(Shell.class.getName())
                .actionId("")
                .initiatorComponentId("content")
                .componentState(Map.of())
                .build());
    assertThat(wire).contains("About this app").doesNotContain("NotFound");
  }

  @Test
  void theSameContentLoadWithNoTypeRendersItToo() {
    var wire =
        wire(
            RunActionRqDto.builder()
                .route("/x/static-page")
                .consumedRoute("")
                .actionId("")
                .initiatorComponentId("content")
                .componentState(Map.of())
                .build());
    assertThat(wire).contains("About this app");
  }
}
