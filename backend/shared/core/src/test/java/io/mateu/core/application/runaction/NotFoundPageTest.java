package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.dev.DevMode;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.junit.jupiter.api.Test;

/** The texts and the way back of the not-found page, for the cases the sync suite does not hit. */
class NotFoundPageTest {

  private static RunActionCommand command(String route, String acceptLanguage) {
    var request = new FakeHttpRequest(RunActionRqDto.builder().route(route).build());
    if (acceptLanguage != null) {
      request.withHeader("Accept-Language", acceptLanguage);
    }
    return new RunActionCommand(
        "", null, route, "", "", Map.of(), Map.of(), null, request, null, null);
  }

  @Test
  void onlyALoadOfTheRouteCountsAsAMissingPage() {
    assertThat(NotFoundPage.isLoad(null)).isTrue();
    assertThat(NotFoundPage.isLoad(" ")).isTrue();
    assertThat(NotFoundPage.isLoad("__load__")).isTrue();
    assertThat(NotFoundPage.isLoad("save")).isFalse();
  }

  @Test
  void theMissingRecordIsFoundBehindReflectionAndCauses() {
    var missing = new NoSuchElementException("gone");
    var wrapped = new RuntimeException(new InvocationTargetException(missing));
    assertThat(NotFoundPage.find(wrapped)).isSameAs(missing);
    assertThat(NotFoundPage.find(new IllegalStateException("other"))).isNull();
    assertThat(NotFoundPage.find(null)).isNull();
  }

  @Test
  void optionalsOwnMessageIsReplacedByAGenericTextNamingTheId() {
    var page =
        NotFoundPage.forMissing(
            new NoSuchElementException("No value present"), command("/bookings/FO-1?x=1", null));
    assertThat(page.title()).isEqualTo("Not found: FO-1");
    assertThat(page.backRoute()).isEqualTo("/bookings");
    assertThat(page.backLabel()).isEqualTo("Go back");
  }

  @Test
  void aRootRouteHasNoIdToNameAndGoesBackToTheHome() {
    var english = NotFoundPage.forMissing(new NoSuchElementException(), command("/_empty", null));
    assertThat(english.title()).isEqualTo("Not found");
    assertThat(english.backRoute()).isEqualTo("/");
    var spanish = NotFoundPage.forMissing(new NoSuchElementException(), command("", "es-ES"));
    assertThat(spanish.title()).isEqualTo("No encontrado");
    assertThat(spanish.backLabel()).isEqualTo("Volver");
    assertThat(spanish.message()).startsWith("Puede que");
  }

  @Test
  void anUnknownRouteInSpanishSaysSo() {
    var page = NotFoundPage.forUnknownRoute(command("/a/b/", "es"), null);
    assertThat(page.title()).isEqualTo("Página no encontrada");
    assertThat(page.backRoute()).isEqualTo("/a");
  }

  @Test
  void inDevelopmentModeTheUnreadableDefinitionsAreNamed() {
    var base = NotFoundPage.forUnknownRoute(command("/x", null), null);
    assertThat(NotFoundPage.withSpecProblems(base, List.of())).isSameAs(base);
    assertThat(NotFoundPage.withSpecProblems(base, List.of("x.yaml: bad key")).message())
        .isEqualTo("Development mode — a definition could not be read: x.yaml: bad key");
    var two = NotFoundPage.withSpecProblems(base, List.of("a.yaml: one", "b.yaml: two"));
    assertThat(two.message())
        .isEqualTo("Development mode — 2 definitions could not be read: a.yaml: one · b.yaml: two");
    assertThat(two.title()).isEqualTo(base.title());
    assertThat(two.backRoute()).isEqualTo(base.backRoute());
  }

  @Test
  void outsideDevelopmentModeTheServersFilesAreNeverDescribed() {
    org.junit.jupiter.api.Assumptions.assumeFalse(DevMode.enabled());
    var problems = new YamlSpecProblems();
    var page = NotFoundPage.forUnknownRoute(command("/x", null), problems);
    assertThat(page.message()).isEqualTo("It may have been deleted, or the link is wrong.");
  }

  @Test
  void pathsAreNormalised() {
    assertThat(NotFoundPage.pathOf(null)).isEqualTo("/");
    assertThat(NotFoundPage.pathOf("a/b//?q")).isEqualTo("/a/b");
    assertThat(NotFoundPage.lastSegment("/")).isNull();
    assertThat(NotFoundPage.parentOf("/top")).isEqualTo("/");
  }
}
