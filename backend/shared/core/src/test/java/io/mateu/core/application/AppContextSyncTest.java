package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Application-level context selectors: an @AppContext field on the app class becomes a header
 * widget whose options come from the field's type (enum constants or a LookupOptionsSupplier); the
 * selected value lives in the app state under the field name and any action can read it via
 * httpRequest.appContext(fieldName).
 */
class AppContextSyncTest {

  @SuppressWarnings("unused")
  public enum Environment {
    STAGING,
    PRODUCTION
  }

  public static class HotelPicker implements LookupOptionsSupplier {
    @Override
    public ListingData<Option> search(
        String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.of(
          java.util.stream.Stream.of(new Option("1", "Hotel 1"), new Option("2", "Hotel 2"))
              .filter(
                  option ->
                      searchText == null
                          || option.label().toLowerCase().contains(searchText.toLowerCase()))
              .toArray(Option[]::new));
    }
  }

  @SuppressWarnings("unused")
  @UI("/ctx")
  @Title("Context demo")
  public static class ContextApp {

    @Menu String home = "/";

    @AppContext(label = "Hotel")
    HotelPicker hotel;

    @AppContext Environment environment;
  }

  /** A ROOT app ("" route, like most real apps): the search action must dispatch here too. */
  @SuppressWarnings("unused")
  @UI("")
  @Title("Root context demo")
  public static class ContextRootApp {

    @Menu String home = "/";

    @AppContext(label = "Hotel")
    HotelPicker hotel;
  }

  /** A regular screen of the app: reads the context fixed by the header selector. */
  @SuppressWarnings("unused")
  @UI("/ctxprobe")
  @Title("Probe")
  public static class ContextProbe {

    String name = "x";

    @Button
    public Message greet(HttpRequest httpRequest) {
      var hotel = httpRequest.appContext("hotel");
      return new Message(hotel != null ? "hotel " + hotel : "no hotel");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ContextApp.class, ContextProbe.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static AppDto app() {
    var increment = mateu.sync("/ctx");
    var app =
        FullSyncPipelineTest.findMetadata(increment.fragments().get(0).component(), AppDto.class);
    assertThat(app).isNotNull();
    System.out.println(
        "DBG serverSideType=" + app.serverSideType() + " selectors=" + app.contextSelectors());
    return app;
  }

  @Test
  void appContextFieldsBecomeContextSelectorsWithTheirOptions() {
    var selectors = app().contextSelectors();
    assertThat(selectors)
        .extracting(io.mateu.dtos.AppContextSelectorDto::fieldName)
        .containsExactly("hotel", "environment");
    var hotel = selectors.get(0);
    assertThat(hotel.label()).isEqualTo("Hotel");
    assertThat(hotel.options())
        .extracting(io.mateu.dtos.OptionDto::label)
        .containsExactly("Hotel 1", "Hotel 2");
    var environment = selectors.get(1);
    assertThat(environment.options())
        .extracting(io.mateu.dtos.OptionDto::value)
        .containsExactly("STAGING", "PRODUCTION");
  }

  @Test
  void actionsReadTheContextValueFromTheAppState() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/ctxprobe")
                .serverSideType(ContextProbe.class.getName())
                .actionId("greet")
                .initiatorComponentId("ctx_app")
                .componentState(Map.of())
                .appState(Map.of("hotel", "2"))
                .build());
    assertThat(increment.messages()).extracting(m -> m.text()).contains("hotel 2");
  }

  @Test
  void appContextSearchActionReturnsMatchingOptions() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/ctx")
                .serverSideType(ContextApp.class.getName())
                .actionId("_appcontext-search-hotel")
                .initiatorComponentId("ctx_app")
                .componentState(Map.of())
                .parameters(Map.of("searchText", "hotel 2"))
                .build());
    var data = (Map<?, ?>) increment.fragments().get(0).data();
    var page = (io.mateu.uidl.data.Page<?>) data.get("_appcontext_hotel");
    assertThat(page.content())
        .extracting(option -> ((Option) option).label())
        .containsExactly("Hotel 2");
  }

  @Test
  void appContextSearchActionWorksOnTheRootApp() {
    // most real apps live at the ROOT route ("") — the native renderers and the web picker send
    // route "" + the app's serverSideType, and the search must dispatch exactly like on a routed
    // app (own harness: a root app changes route resolution for every other fixture)
    try (var rootMateu = TestMateu.withUis(ContextRootApp.class)) {
      var increment =
          rootMateu.run(
              RunActionRqDto.builder()
                  .route("")
                  .consumedRoute("")
                  .serverSideType(ContextRootApp.class.getName())
                  .actionId("_appcontext-search-hotel")
                  .initiatorComponentId("appcontext-hotel")
                  .componentState(Map.of())
                  .parameters(Map.of("searchText", "hotel 2"))
                  .build());
      var data = (Map<?, ?>) increment.fragments().get(0).data();
      assertThat(data).isNotNull();
      var page = (io.mateu.uidl.data.Page<?>) data.get("_appcontext_hotel");
      assertThat(page.content())
          .extracting(option -> ((Option) option).label())
          .containsExactly("Hotel 2");
    }
  }

  @Test
  void appContextSearchActionFiltersEnumConstants() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/ctx")
                .serverSideType(ContextApp.class.getName())
                .actionId("_appcontext-search-environment")
                .initiatorComponentId("ctx_app")
                .componentState(Map.of())
                .parameters(Map.of("searchText", "prod"))
                .build());
    var data = (Map<?, ?>) increment.fragments().get(0).data();
    var page = (io.mateu.uidl.data.Page<?>) data.get("_appcontext_environment");
    assertThat(page.content())
        .extracting(option -> ((Option) option).value())
        .containsExactly("PRODUCTION");
  }

  @Test
  void missingContextReadsAsNull() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/ctxprobe")
                .serverSideType(ContextProbe.class.getName())
                .actionId("greet")
                .initiatorComponentId("ctx_app")
                .componentState(Map.of())
                .appState(Map.of())
                .build());
    assertThat(increment.messages()).extracting(m -> m.text()).contains("no hotel");
  }
}
