package io.mateu.core.infra.versioning;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.extern.slf4j.Slf4j;

/**
 * Warns about UI modules mounted in-process (a jar of {@code @UI} classes on the classpath) that
 * were compiled against another Mateu {@code major.minor} than the one running them. Their classes
 * run against this process's Mateu, which is only supported for the same minor. The indexer
 * annotation processor records its version in each entry of {@code META-INF/mateu/ui-registrations}
 * ({@code mateuVersion=…}); an index without it was written by a release older than that record,
 * and is not reported.
 */
@Slf4j
public final class ModuleVersions {

  static final String INDEX = "META-INF/mateu/ui-registrations";

  private static final AtomicBoolean CHECKED = new AtomicBoolean();

  private ModuleVersions() {}

  /** One mismatch: the index file and the version it was built with. */
  public record Mismatch(String index, String moduleVersion, String hostVersion) {}

  /** Runs {@link #check} once per process, logging every mismatch at WARN. */
  public static void checkOnce(ClassLoader cl) {
    if (!CHECKED.compareAndSet(false, true)) {
      return;
    }
    for (var mismatch : check(cl, MateuVersion.current())) {
      log.warn(
          "UI module {} was built with Mateu {}, this application runs Mateu {}. In-process modules"
              + " must be built against the same Mateu minor version: rebuild the module, or mount"
              + " it as a separate service (RemoteMenu).",
          mismatch.index(),
          mismatch.moduleVersion(),
          mismatch.hostVersion());
    }
  }

  /** The indexes that record a {@code major.minor} other than {@code hostVersion}'s. */
  public static List<Mismatch> check(ClassLoader cl, String hostVersion) {
    var out = new ArrayList<Mismatch>();
    var host = MateuVersion.majorMinor(hostVersion);
    if (host == null) {
      return out;
    }
    try {
      var urls = cl.getResources(INDEX);
      while (urls.hasMoreElements()) {
        var url = urls.nextElement();
        var recorded = recordedVersion(url);
        var module = MateuVersion.majorMinor(recorded);
        if (module != null && !module.equals(host)) {
          out.add(new Mismatch(location(url), recorded, hostVersion));
        }
      }
    } catch (IOException e) {
      log.debug("could not read the UI module indexes: {}", e.toString());
    }
    return out;
  }

  /** The first {@code mateuVersion=} of an index file, or null. */
  static String recordedVersion(URL url) {
    String text;
    try (InputStream in = url.openStream()) {
      text = new String(in.readAllBytes(), StandardCharsets.UTF_8);
    } catch (IOException e) {
      return null;
    }
    for (var line : text.split("\\R")) {
      var trimmed = line.trim();
      if (trimmed.startsWith("mateuVersion=")) {
        var value = trimmed.substring("mateuVersion=".length()).trim();
        return value.isEmpty() ? null : value;
      }
    }
    return null;
  }

  /** The jar (or directory) an index lives in, for the log line. */
  private static String location(URL url) {
    var text = url.toString();
    var bang = text.indexOf("!/");
    return bang > 0 ? text.substring(0, bang) : text;
  }

  /** Lets {@link #checkOnce} run again (tests). */
  static void reset() {
    CHECKED.set(false);
  }
}
