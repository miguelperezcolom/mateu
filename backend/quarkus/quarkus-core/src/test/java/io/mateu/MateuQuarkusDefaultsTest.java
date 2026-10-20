package io.mateu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.io.IOException;
import java.util.Properties;
import org.junit.jupiter.api.Test;

/**
 * The defaults mateu-quarkus ships in its jar (META-INF/microprofile-config.properties, ordinal
 * 100: the application's own configuration overrides each of them).
 */
class MateuQuarkusDefaultsTest {

  private static Properties defaults() throws IOException {
    var properties = new Properties();
    try (var in =
        MateuQuarkusDefaultsTest.class
            .getClassLoader()
            .getResourceAsStream("META-INF/microprofile-config.properties")) {
      assertNotNull(in, "mateu-quarkus ships its configuration defaults");
      properties.load(in);
    }
    return properties;
  }

  @Test
  void keepsTheApplicationsBeans() throws IOException {
    assertEquals("fwk", defaults().getProperty("quarkus.arc.remove-unused-beans"));
  }

  /**
   * Live reload under {@code quarkus:dev} without configuring anything — and only there: the
   * packaged application (prod profile) and the tests never turn development mode on.
   */
  @Test
  void developmentModeIsOnInTheDevProfileOnly() throws IOException {
    var defaults = defaults();
    assertEquals("true", defaults.getProperty("%dev.mateu.dev"));
    assertNull(defaults.getProperty("mateu.dev"));
    assertNull(defaults.getProperty("%test.mateu.dev"));
    assertNull(defaults.getProperty("%prod.mateu.dev"));
  }
}
