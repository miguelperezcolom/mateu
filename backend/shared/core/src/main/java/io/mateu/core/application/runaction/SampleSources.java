package io.mateu.core.application.runaction;

/**
 * Whether REST sources answer with their SAMPLE data instead of calling the endpoint.
 *
 * <p>The rule, the same on every leg and in every renderer: sample data is used ALWAYS in the
 * visual editor (canvas and Play), in a bundle built with the mock flag ({@code
 * -Dmateu.bundle.mock=true}), and at runtime ONLY when the app opts in — {@code
 * -Dmateu.sources.mock=true} or the environment variable {@code MATEU_SOURCES_MOCK=true}. Never
 * silently in production: a source carrying a sample is called for real unless one of those says
 * otherwise.
 *
 * <p>When the server is in sample mode it says so on the wire ({@code AppDto.mockSources}) so the
 * browser short-circuits its DIRECT fetches too: both legs — the proxied one here and the direct
 * one in {@code fetchExternalJson} — have to agree, or a page would mix real and sample data.
 */
public final class SampleSources {

  public static final String PROPERTY = "mateu.sources.mock";
  public static final String ENV = "MATEU_SOURCES_MOCK";
  public static final String BUNDLE_PROPERTY = "mateu.bundle.mock";

  private SampleSources() {}

  /** True when the running app opted into sample data. */
  public static boolean enabled() {
    return truthy(System.getProperty(PROPERTY)) || truthy(System.getenv(ENV));
  }

  /** True when a bundle being exported should ship (and use) the samples. */
  public static boolean forBundle() {
    return truthy(System.getProperty(BUNDLE_PROPERTY)) || enabled();
  }

  private static boolean truthy(String value) {
    return value != null && ("true".equalsIgnoreCase(value.trim()) || "1".equals(value.trim()));
  }
}
