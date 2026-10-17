package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.RestSource;
import io.mateu.uidl.annotations.RestSources;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.data.RestSourceProvenance;
import io.mateu.uidl.interfaces.RestSourceCatalogSupplier;
import java.io.IOException;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The three channels that feed the REST source catalogue — a {@code sources.yaml},
 * {@code @RestSource} on a registered view (also through a composed annotation), and {@link
 * RestSourceCatalogSupplier} beans — and how the authored file reads: sample data inline or from a
 * file, unknown provenance falls back to inference, a nameless entry is ignored, and a file that
 * does not parse leaves an empty catalogue instead of breaking every screen.
 */
class RestSourceCatalogueChannelsTest {

  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.TYPE)
  @RestSource(
      name = "composed",
      url = "/api/composed",
      fields = {"owner = owner.name", "bad"})
  @interface ComposedSource {}

  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.TYPE)
  @RestSources({
    @RestSource(name = "first", url = "/api/first"),
    @RestSource(name = "second", url = "https://other.example.com/second")
  })
  @interface TwoSources {}

  @ComposedSource
  @TwoSources
  @RestSource(name = "own", url = "/api/own", headers = "Accept: text/csv")
  @RestSource(name = "", url = "/api/ignored")
  public static class CatalogueView {}

  public static class Contributor implements RestSourceCatalogSupplier {
    @Override
    public List<RestSourceEntry> restSources() {
      return java.util.Arrays.asList(
          new RestSourceEntry(
              "fromBean",
              RestDataSource.builder().url("/api/bean").build(),
              RestSourceProvenance.generate,
              Map.of(),
              "",
              ""),
          new RestSourceEntry(
              "own", // a bean entry replaces an annotated one of the same name
              RestDataSource.builder().url("/api/own-from-bean").build(),
              RestSourceProvenance.generate,
              Map.of(),
              "",
              ""),
          new RestSourceEntry(" ", RestDataSource.builder().build(), null, null, null, null),
          null);
    }
  }

  /**
   * Serves {@code specs/ui/**} and the route index from one fixture dir, nothing from elsewhere.
   */
  static final class Fixture extends ClassLoader {
    private final URLClassLoader files;

    Fixture(String name) {
      super(RestSourceCatalogueChannelsTest.class.getClassLoader());
      URL root =
          RestSourceCatalogueChannelsTest.class.getResource("/s1-rest-sources/" + name + "/");
      this.files = new URLClassLoader(new URL[] {root}, null);
    }

    private static boolean isFixture(String name) {
      return name.startsWith("specs/ui") || name.startsWith("META-INF/mateu/");
    }

    @Override
    public URL getResource(String name) {
      return isFixture(name) ? files.getResource(name) : super.getResource(name);
    }

    @Override
    public Enumeration<URL> getResources(String name) throws IOException {
      return isFixture(name) ? files.getResources(name) : super.getResources(name);
    }
  }

  static TestMateu mateu;
  final RestSourceRegistry registry = new RestSourceRegistry();

  @BeforeAll
  static void boot() {
    // registers the supplier bean in the static bean holder the registry asks
    mateu = TestMateu.withUisAndBeans(List.of(new Contributor()));
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static <T> T withContext(ClassLoader cl, java.util.function.Supplier<T> body) {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(cl);
    try {
      return body.get();
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  @Test
  void theAuthoredFileReadsSamplesProvenanceAndTheNestedRequest() {
    var fixture = new Fixture("full");
    var catalogue = withContext(fixture, () -> registry.authoredFrom(fixture));

    assertThat(catalogue.sources())
        .extracting(RestSourceEntry::name)
        .containsExactly("weather", "planets", "bare", "missingSample");

    var weather = catalogue.get("weather").orElseThrow();
    assertThat(weather.effectiveProvenance()).isEqualTo(RestSourceProvenance.existing);
    assertThat(weather.description()).isEqualTo("Forecast by city");
    assertThat(weather.source().proxy()).isTrue();
    assertThat(weather.source().method()).isEqualTo("GET");
    assertThat(weather.source().headers())
        .containsEntry("X-Api-Key", "${secret.WEATHER}")
        .containsEntry("Accept", "application/json");
    assertThat(weather.source().valuePath()).isEqualTo("value");
    assertThat(weather.source().labelPath()).isEqualTo("label");
    assertThat(weather.effectiveSample())
        .isEqualTo(Map.of("city", "Palma", "days", List.of(Map.of("max", 31))));

    var planets = catalogue.get("planets").orElseThrow();
    assertThat(planets.provenance()).isEqualTo(RestSourceProvenance.auto);
    assertThat(planets.effectiveProvenance()).isEqualTo(RestSourceProvenance.generate);
    assertThat(planets.source().method()).isEqualTo("POST");
    assertThat(planets.source().body()).isEqualTo("{\"q\":\"${state.q}\"}");
    assertThat(planets.effectiveSample()).isEqualTo(List.of(Map.of("id", 1, "name", "Tatooine")));

    // no source: an empty request, not a failure
    assertThat(catalogue.get("bare").orElseThrow().source().url()).isNullOrEmpty();
    // a sampleFile that is not there leaves the entry without a sample
    assertThat(catalogue.get("missingSample").orElseThrow().effectiveSample()).isNull();
  }

  @Test
  void aBareListIsACatalogueTooAndAnythingElseIsAnEmptyOne() {
    var list = new Fixture("list");
    assertThat(registry.authoredFrom(list).sources())
        .extracting(RestSourceEntry::name)
        .containsExactly("flat");
    assertThat(registry.authoredFrom(new Fixture("scalar")).hasNoSources()).isTrue();
    assertThat(registry.authoredFrom(new Fixture("broken")).hasNoSources()).isTrue();
  }

  @Test
  void theDerivedHalfCollectsDirectComposedAndBeanDeclarations() {
    var derived = registry.derivedFrom(new Fixture("derived"));
    var byName = new java.util.LinkedHashMap<String, RestSourceEntry>();
    derived.sources().forEach(e -> byName.put(e.name(), e));

    assertThat(byName).containsKeys("own", "composed", "first", "second", "fromBean");
    assertThat(byName).doesNotContainKeys("", " ");
    // the bean contributed last, so its "own" replaces the annotated one
    assertThat(byName.get("own").source().url()).isEqualTo("/api/own-from-bean");
    // "name = path" pairs, trimmed; a pair without '=' is not a mapping
    assertThat(byName.get("composed").fields()).containsExactly(Map.entry("owner", "owner.name"));
    assertThat(byName.get("second").effectiveProvenance()).isEqualTo(RestSourceProvenance.existing);
  }

  @Test
  void theCatalogueIsLoadedOnceAndDroppedWhenSpecsChange() {
    var fixture = new Fixture("list");
    var first =
        withContext(
            fixture,
            () -> {
              var c = registry.catalog();
              assertThat(registry.catalog()).isSameAs(c);
              return c;
            });
    assertThat(first.get("flat")).isPresent();
    assertThat(withContext(fixture, () -> registry.get("fromBean"))).isPresent();

    registry.invalidateSpecs();
    var reloaded = withContext(new Fixture("scalar"), registry::catalog);
    assertThat(reloaded.get("flat")).isEmpty();
  }
}
