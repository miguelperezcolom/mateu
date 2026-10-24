package io.mateu.core.infra.versioning;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import java.util.regex.Pattern;

/**
 * The Mateu release this process runs, read from the {@code pom.properties} Maven writes into the
 * {@code mateu-core} jar. Running from a build directory (an IDE, the core's own tests) there is no
 * jar, so the version is unknown.
 */
public final class MateuVersion {

  private static final Pattern MAJOR_MINOR = Pattern.compile("^(\\d+)\\.(\\d+)");

  private static volatile String current;

  private MateuVersion() {}

  /** The running Mateu version ({@code 3.0-beta.12}, {@code 3.1.0}…), or null when unknown. */
  public static String current() {
    var known = current;
    if (known == null) {
      known = read(MateuVersion.class, "mateu-core");
      current = known != null ? known : "";
    }
    return known == null || known.isEmpty() ? null : known;
  }

  /**
   * The version recorded in the {@code pom.properties} of an {@code io.mateu} artifact that {@code
   * anchor}'s classloader sees, or null.
   */
  public static String read(Class<?> anchor, String artifactId) {
    try (InputStream in =
        anchor.getResourceAsStream("/META-INF/maven/io.mateu/" + artifactId + "/pom.properties")) {
      if (in == null) {
        return null;
      }
      var properties = new Properties();
      properties.load(in);
      var version = properties.getProperty("version");
      return version == null || version.isBlank() ? null : version.trim();
    } catch (IOException e) {
      return null;
    }
  }

  /**
   * The {@code major.minor} of a release version ({@code 3.0-beta.12} → {@code 3.0}), or null for
   * anything that is not a release: unparseable, or a local development build (major 0, e.g. the
   * repository's own {@code 0.0.1-MATEU}).
   */
  public static String majorMinor(String version) {
    if (version == null) {
      return null;
    }
    var matcher = MAJOR_MINOR.matcher(version.trim());
    if (!matcher.find() || "0".equals(matcher.group(1))) {
      return null;
    }
    return matcher.group(1) + "." + matcher.group(2);
  }
}
