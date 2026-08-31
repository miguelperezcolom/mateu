package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.StaticView;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Template-ref / ETag for screen structure (phase b of the client structure cache).
 *
 * <p>Pins the wire contract of {@link io.mateu.core.infra.StructureHashPostProcessor}: a route load
 * carries a stable {@code structureHash}; echoing that hash back as {@code knownStructureHash}
 * omits the component (state/data still travel); a stale or absent hash sends the full structure.
 */
class StructureCacheEtagSyncTest {

  @UI("/etag-form")
  public static class EtagForm {
    private String name = "Ada";
    private String city = "London";
    private int age = 42;
  }

  @StaticView
  @UI("/static-form")
  public static class StaticForm {
    private String heading = "About";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(EtagForm.class, StaticForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto load(String route, String knownStructureHash) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .actionId("")
            .knownStructureHash(knownStructureHash)
            .build());
  }

  private static ServerSideComponentDto componentOf(UIIncrementDto increment) {
    assertThat(increment.fragments()).isNotEmpty();
    return (ServerSideComponentDto) increment.fragments().get(0).component();
  }

  @Test
  void aRouteLoadCarriesAStructureHash() {
    var component = componentOf(load("/etag-form", null));
    assertThat(component.structureHash()).isNotBlank();
  }

  @Test
  void theStructureHashIsStableAcrossIdenticalLoads() {
    // Empirical guard against volatile fields leaking into the hash: two identical loads must
    // produce the SAME hash, or the ETag would never match and the optimization would be dead.
    var first = componentOf(load("/etag-form", null)).structureHash();
    var second = componentOf(load("/etag-form", null)).structureHash();
    assertThat(second).isEqualTo(first);
  }

  @Test
  void echoingTheMatchingHashOmitsTheComponentButKeepsStateAndData() {
    var hash = componentOf(load("/etag-form", null)).structureHash();

    var increment = load("/etag-form", hash);
    assertThat(increment.fragments()).hasSize(1);
    UIFragmentDto fragment = increment.fragments().get(0);
    // structure dropped …
    assertThat(fragment.component()).isNull();
    // … but the fragment (and thus its state/data channel) still arrives so the client can hydrate
    assertThat(fragment.state()).isNotNull();
  }

  @Test
  void aStaleHashStillSendsTheFullStructure() {
    var increment = load("/etag-form", "not-the-current-hash");
    var component = componentOf(increment);
    assertThat(component).isNotNull();
    // and it advertises the current hash so the client can re-cache and match next time
    assertThat(component.structureHash()).isNotBlank();
  }

  @Test
  void aNullHashSendsTheFullStructure() {
    // the old-client / cold-cache path
    assertThat(componentOf(load("/etag-form", null))).isNotNull();
  }

  @Test
  void staticViewIsFlaggedOnlyWhenDeclared() {
    // @StaticView → the client may cache the full response and skip revalidation for the session
    assertThat(componentOf(load("/static-form", null)).staticView()).isTrue();
    // a plain view is not static
    assertThat(componentOf(load("/etag-form", null)).staticView()).isFalse();
  }

  @Test
  void aStaticViewIsNeverOmittedEvenWhenTheHashMatches() {
    // so the client always learns staticView (and caches the full response) the first time it sees
    // the view in a session, then skips the round-trip entirely on return visits
    var hash = componentOf(load("/static-form", null)).structureHash();
    var component = componentOf(load("/static-form", hash));
    assertThat(component).isNotNull();
    assertThat(component.staticView()).isTrue();
  }
}
