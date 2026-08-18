package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.DeclaredRestSource;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceKind;
import io.mateu.uidl.interfaces.RestSourceSupplier;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Proxy mode for a view that builds its sources at runtime: a form assembled from a stored
 * definition has no annotation to read, so it says what it declared through {@link
 * RestSourceSupplier} and gets the same __restfetch__ treatment an annotated one gets.
 */
class RestSourceSupplierProxyTest {

  @SuppressWarnings("unused")
  @UI("/suppliedproxy")
  @Title("Supplied proxy")
  public static class SuppliedProxyForm implements RestSourceSupplier {
    String country;

    @Override
    public List<DeclaredRestSource> declaredRestSources() {
      return List.of(
          new DeclaredRestSource(
              RestSourceKind.OPTIONS,
              "country",
              RestDataSource.builder()
                  .url("https://api.example.com/countries?t=${secret.TOKEN}")
                  .valuePath("code")
                  .labelPath("name")
                  .proxy(true)
                  .build()));
    }
  }

  @SuppressWarnings("unused")
  @UI("/supplieddirect")
  @Title("Supplied direct")
  public static class SuppliedDirectForm implements RestSourceSupplier {
    String country;

    @Override
    public List<DeclaredRestSource> declaredRestSources() {
      return List.of(
          new DeclaredRestSource(
              RestSourceKind.OPTIONS,
              "country",
              RestDataSource.builder().url("https://public.example.com/countries").build()));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(SuppliedProxyForm.class, SuppliedDirectForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aViewThatDeclaresAProxySourceAtRuntimeAdvertisesTheRestfetchAction() {
    var component =
        (ServerSideComponentDto) mateu.sync("/suppliedproxy").fragments().get(0).component();

    assertThat(component.actions().stream().anyMatch(a -> "__restfetch__".equals(a.id()))).isTrue();
  }

  @Test
  void declaringOnlyDirectSourcesStillDoesNotAdvertiseIt() {
    var component =
        (ServerSideComponentDto) mateu.sync("/supplieddirect").fragments().get(0).component();

    assertThat(component.actions().stream().anyMatch(a -> "__restfetch__".equals(a.id())))
        .isFalse();
  }
}
