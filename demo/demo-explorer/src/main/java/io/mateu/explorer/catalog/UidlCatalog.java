package io.mateu.explorer.catalog;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.yaml.snakeyaml.Yaml;

/**
 * Mateu's own component catalogue — {@code uidl-catalog.json}, generated from the records' Javadoc
 * and packaged in the mateu-uidl jar. The entry pages take a component's one-line description from
 * here, and the coverage test takes the list of types that must have an entry.
 */
public final class UidlCatalog {

  public static final String PATH = "META-INF/mateu/schema/uidl-catalog.json";

  private static volatile Map<String, String> descriptions;

  public record Family(String name, List<String> types) {}

  private UidlCatalog() {}

  /** type → its one-line description. */
  public static Map<String, String> descriptions() {
    if (descriptions == null) {
      var raw = raw();
      var map = new LinkedHashMap<String, String>();
      for (var c : (List<Map<String, Object>>) raw.get("components")) {
        map.put((String) c.get("type"), (String) c.get("description"));
      }
      descriptions = map;
    }
    return descriptions;
  }

  /** family name → its member types (FormTemplate, Actionable, Trigger…). */
  @SuppressWarnings("unchecked")
  public static Map<String, List<String>> families() {
    return (Map<String, List<String>>) raw().get("families");
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> raw() {
    try (InputStream in = UidlCatalog.class.getClassLoader().getResourceAsStream(PATH)) {
      if (in == null) {
        throw new IllegalStateException("No " + PATH + " on the classpath (mateu-uidl)");
      }
      // JSON is YAML: SnakeYAML reads it, no extra dependency.
      return new Yaml().load(in);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
