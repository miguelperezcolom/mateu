package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import io.mateu.core.application.runaction.ErrorBoundary;
import io.mateu.core.application.runaction.RunActionUseCase;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.NotFoundDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

/**
 * A route whose record does not exist renders a NOT FOUND page, not an error.
 *
 * <p>Seen on ec-demo1: opening {@code /reservas/FO-X6JB7F} for a deleted stay, the view threw
 * {@code NoSuchElementException("No stay FO-X6JB7F")} while loading, Mateu logged it as an ERROR
 * with its stack and answered an error toast — and the page stayed empty. Now any {@link
 * NoSuchElementException} thrown while a route LOADS answers a {@link NotFoundDto} in place of the
 * content (logged at INFO, one line), with the exception's message as the heading; with no usable
 * message the heading is a generic text naming the id. Other exceptions, and a NoSuchElement thrown
 * by an action on a screen that does exist, keep today's error message.
 */
class NotFoundPageSyncTest {

  public record Stay(String id, String guest) {}

  private static final List<Stay> STAYS = List.of(new Stay("FO-1", "Ana"));

  /** A Navigable listing: its detail route is {@code /stays/:id}, served by {@code view(id)}. */
  @UI("/stays")
  public static class Stays implements Listing<Stay>, Navigable<Stay, String> {
    @Override
    public ListingData<Stay> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(STAYS);
    }

    @Override
    public Stay view(String id, HttpRequest httpRequest) {
      return STAYS.stream()
          .filter(stay -> stay.id().equals(id))
          .findFirst()
          .orElseThrow(() -> new NoSuchElementException("Reserva " + id + " no encontrada"));
    }
  }

  /**
   * The same, finding the record the Optional way: {@code orElseThrow()} says "No value present".
   */
  @UI("/rooms")
  public static class Rooms implements Listing<Stay>, Navigable<Stay, String> {
    @Override
    public ListingData<Stay> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(STAYS);
    }

    @Override
    public Stay view(String id, HttpRequest httpRequest) {
      return Optional.<Stay>empty().orElseThrow();
    }
  }

  /** A plain view whose constructor fails to find what it shows. */
  @UI("/broken")
  public static class Broken {
    public Broken() {
      throw new NoSuchElementException("No stay FO-X6JB7F");
    }
  }

  /** A view that fails on load with something that is NOT a missing record. */
  @UI("/exploding")
  public static class Exploding {
    public Exploding() {
      throw new IllegalStateException("database down");
    }
  }

  /** A screen that exists, with a button that throws NoSuchElement: not a missing page. */
  @UI("/screen")
  public static class Screen {
    String name = "x";

    @Action
    void lookup(HttpRequest httpRequest) {
      throw new NoSuchElementException("No such voucher");
    }
  }

  static TestMateu mateu;
  private ListAppender<ILoggingEvent> logs;
  private Logger useCaseLogger;
  private Logger boundaryLogger;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(Stays.class, Rooms.class, Broken.class, Exploding.class, Screen.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void captureLogs() {
    useCaseLogger = (Logger) LoggerFactory.getLogger(RunActionUseCase.class);
    logs = new ListAppender<>();
    logs.start();
    useCaseLogger.addAppender(logs);
    // the error boundary is where an unexpected failure is logged (with its reference id)
    boundaryLogger = (Logger) LoggerFactory.getLogger(ErrorBoundary.class);
    boundaryLogger.addAppender(logs);
  }

  @AfterEach
  void releaseLogs() {
    useCaseLogger.detachAppender(logs);
    boundaryLogger.detachAppender(logs);
  }

  // ── a NoSuchElementException while loading → the not-found page ──────────────

  @Test
  void aDetailWhoseRecordIsMissingRendersTheNotFoundPageWithTheExceptionsMessage() {
    var notFound = notFoundOf(detail(Stays.class, "/stays/FO-X6JB7F", "/stays"));

    assertThat(notFound.title()).isEqualTo("Reserva FO-X6JB7F no encontrada");
    assertThat(notFound.message()).isEqualTo("It may have been deleted, or the link is wrong.");
    assertThat(notFound.backRoute()).isEqualTo("/stays");
    assertThat(notFound.backLabel()).isNotBlank();
  }

  @Test
  void itIsNotLoggedAsAnErrorButAsOneInfoLine() {
    detail(Stays.class, "/stays/FO-X6JB7F", "/stays");

    assertThat(logs.list).noneMatch(event -> event.getLevel() == Level.ERROR);
    assertThat(logs.list)
        .anySatisfy(
            event -> {
              assertThat(event.getLevel()).isEqualTo(Level.INFO);
              assertThat(event.getFormattedMessage())
                  .contains("/stays/FO-X6JB7F")
                  .contains("Reserva FO-X6JB7F no encontrada");
              assertThat(event.getThrowableProxy()).isNull();
            });
  }

  @Test
  void withNoUsableMessageTheHeadingIsGenericAndNamesTheId() {
    var notFound = notFoundOf(detail(Rooms.class, "/rooms/R-404", "/rooms"));

    assertThat(notFound.title()).isEqualTo("Not found: R-404");
    assertThat(notFound.backRoute()).isEqualTo("/rooms");
  }

  @Test
  void theGenericTextsFollowTheRequestsLanguage() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/rooms/R-404")
                .consumedRoute("/rooms")
                .serverSideType(Rooms.class.getName())
                .actionId("")
                .initiatorComponentId("app")
                .componentState(Map.of())
                .build(),
            Map.of("Accept-Language", "es-ES,es;q=0.9"));
    var notFound = notFoundOf(increment);

    assertThat(notFound.title()).isEqualTo("No se ha encontrado R-404");
    assertThat(notFound.message())
        .isEqualTo("Puede que se haya borrado o que el enlace no sea correcto.");
    assertThat(notFound.backLabel()).isEqualTo("Volver");
  }

  @Test
  void aViewThatThrowsWhileBeingCreatedAlsoRendersIt() {
    var notFound = notFoundOf(mateu.sync("/broken"));

    assertThat(notFound.title()).isEqualTo("No stay FO-X6JB7F");
    assertThat(notFound.backRoute()).isEqualTo("/");
    assertThat(logs.list).noneMatch(event -> event.getLevel() == Level.ERROR);
  }

  // ── a route that resolves to nothing → the same page ─────────────────────────

  @Test
  void anUnknownRouteRendersTheSamePageInsteadOfABareText() {
    var increment = mateu.sync("/no/such/route");
    var notFound = notFoundOf(increment);

    assertThat(notFound.title()).isEqualTo("Page not found");
    assertThat(notFound.backRoute()).isEqualTo("/no/such");
    assertThat(String.valueOf(increment)).doesNotContain("Not found.");
  }

  // ── everything else keeps today's behaviour ─────────────────────────────────

  @Test
  void otherExceptionsOnLoadAreAGenericErrorWithAReferenceTheErrorLogCarries() {
    var increment = mateu.sync("/exploding");

    assertThat(found(increment, NotFoundDto.class)).isEmpty();
    // the raw exception message is for the log, not for the user
    var text = increment.messages().get(0).text();
    assertThat(text).startsWith(ErrorBoundary.GENERIC_TEXT).doesNotContain("database down");
    var reference = text.substring(ErrorBoundary.GENERIC_TEXT.length());
    assertThat(logs.list)
        .anySatisfy(
            event -> {
              assertThat(event.getLevel()).isEqualTo(Level.ERROR);
              assertThat(event.getFormattedMessage()).contains(reference);
              assertThat(event.getThrowableProxy().getMessage()).contains("database down");
            });
  }

  @Test
  void theDetailedModeShowsTheRawExceptionForDevelopment() {
    System.setProperty(ErrorBoundary.DETAILED, "true");
    try {
      var increment = mateu.sync("/exploding");
      assertThat(increment.messages().get(0).title()).isEqualTo("IllegalStateException");
      assertThat(increment.messages().get(0).text()).contains("database down");
    } finally {
      System.clearProperty(ErrorBoundary.DETAILED);
    }
  }

  @Test
  void aNoSuchElementFromAnActionOnAScreenThatExistsIsStillAnErrorMessage() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/screen")
                .actionId("lookup")
                .serverSideType(Screen.class.getName())
                .componentState(Map.of("name", "x"))
                .initiatorComponentId("app")
                .build());

    assertThat(found(increment, NotFoundDto.class)).isEmpty();
    // an error message (generic: a NoSuchElementException is not addressed to the user)
    assertThat(increment.messages())
        .extracting(MessageDto::text)
        .anyMatch(t -> t.startsWith(ErrorBoundary.GENERIC_TEXT));
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private UIIncrementDto detail(Class<?> listing, String route, String consumedRoute) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumedRoute)
            .serverSideType(listing.getName())
            .actionId("")
            .initiatorComponentId("app")
            .componentState(Map.of())
            .build());
  }

  private static NotFoundDto notFoundOf(UIIncrementDto increment) {
    var found = found(increment, NotFoundDto.class);
    assertThat(found).as("a NotFound component in %s", increment).hasSize(1);
    return found.get(0);
  }

  private static <T> List<T> found(UIIncrementDto increment, Class<T> type) {
    var found = new ArrayList<T>();
    if (increment.fragments() != null) {
      increment.fragments().forEach(f -> FieldKindsSyncTest.walk(f.component(), type, found));
    }
    return found;
  }
}
