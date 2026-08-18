package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.data.DeclaredRestSource;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceKind;
import io.mateu.uidl.interfaces.RestSourceSupplier;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * What a proxy fetch is allowed to resolve to: what the view declared, whether it declared it as an
 * annotation or at runtime — and nothing the client asked for.
 */
class RestSourceResolverTest {

  @SuppressWarnings("unused")
  static class Annotated {
    @RestOptions(url = "https://annotated.example.com/x", proxy = true)
    String country;
  }

  static class Supplied implements RestSourceSupplier {
    @Override
    public List<DeclaredRestSource> declaredRestSources() {
      return List.of(
          new DeclaredRestSource(
              RestSourceKind.OPTIONS,
              "country",
              RestDataSource.builder().url("https://supplied.example.com/x").proxy(true).build()),
          new DeclaredRestSource(
              RestSourceKind.DATA,
              RestDataSource.builder().url("https://supplied.example.com/me").proxy(true).build()));
    }
  }

  /** Declares nothing, so nothing resolves — the shape of a view that is not in on this at all. */
  static class Silent implements RestSourceSupplier {
    @Override
    public List<DeclaredRestSource> declaredRestSources() {
      return List.of();
    }
  }

  @Test
  void resolvesWhatTheViewDeclaredAtRuntime() {
    var source = RestSourceResolver.resolve(new Supplied(), "options", "country");

    assertThat(source).isNotNull();
    assertThat(source.url()).isEqualTo("https://supplied.example.com/x");
  }

  @Test
  void aKindWithOneSourcePerViewNeedsNoId() {
    var source = RestSourceResolver.resolve(new Supplied(), "data", "");

    assertThat(source).isNotNull();
    assertThat(source.url()).isEqualTo("https://supplied.example.com/me");
  }

  @Test
  void anUndeclaredFieldResolvesToNothing() {
    assertThat(RestSourceResolver.resolve(new Supplied(), "options", "other")).isNull();
    assertThat(RestSourceResolver.resolve(new Silent(), "options", "country")).isNull();
    assertThat(RestSourceResolver.resolve(new Supplied(), "rows", "")).isNull();
  }

  @Test
  void theAnnotationPathIsUntouched() {
    var source = RestSourceResolver.resolve(new Annotated(), "options", "country");

    assertThat(source).isNotNull();
    assertThat(source.url()).isEqualTo("https://annotated.example.com/x");
    assertThat(source.proxy()).isTrue();
  }
}
