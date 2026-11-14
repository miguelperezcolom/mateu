package io.mateu.core.infra.observability;

/** For tests in other packages: the series cap of {@link TelemetryNames} is process-wide. */
public final class TelemetryTestSupport {

  private TelemetryTestSupport() {}

  /**
   * Forget the (route, action) series seen so far. Every suite in the JVM adds series, so a test
   * that asserts on route templates must call this BEFORE each test, or it reads "_other" once the
   * cap is reached by whatever ran before it.
   */
  public static void resetSeries() {
    TelemetryNames.reset();
  }
}
