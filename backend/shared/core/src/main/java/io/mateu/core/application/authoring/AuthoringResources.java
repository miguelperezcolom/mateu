package io.mateu.core.application.authoring;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The authoring contract a running app serves to agents — the generated schemas, the component
 * catalogue derived from them and the agent guide — read from the {@code mateu-uidl} jar ({@code
 * META-INF/mateu/schema/}), where the build packages them from the module root. The .NET and Python
 * backends and the MCP sidecar ship the SAME files, so the four serve the same bytes.
 */
public final class AuthoringResources {

  /** Where the files live on the classpath. */
  public static final String CLASSPATH_DIR = "META-INF/mateu/schema/";

  /** One MCP resource: its URI, the file behind it and how it is described. */
  public record Resource(
      String uri, String file, String name, String description, String mimeType) {}

  /** The resources, in the order {@code resources/list} answers them (the same everywhere). */
  public static final List<Resource> RESOURCES =
      List.of(
          new Resource(
              "mateu://guide",
              "authoring-guide.md",
              "Authoring guide",
              "How to write Mateu YAML definitions with these tools: the workflow, a sample page and"
                  + " the rules that keep a definition valid.",
              "text/markdown"),
          new Resource(
              "mateu://catalog",
              "uidl-catalog.json",
              "Component catalogue",
              "Every component type with a one-line description and its main attributes"
                  + " (generated from the schema).",
              "application/json"),
          new Resource(
              "mateu://schema/specs",
              "specs-schema.json",
              "specs/ui schema",
              "JSON Schema of every file under specs/ui: pages, app shells, mounts, routes, sources,"
                  + " actions, translations, environments, field types and the project descriptor.",
              "application/schema+json"),
          new Resource(
              "mateu://schema/uidl",
              "uidl-schema.json",
              "Component schema",
              "JSON Schema of the component catalogue (UIDL).",
              "application/schema+json"));

  private static final ConcurrentHashMap<String, String> TEXTS = new ConcurrentHashMap<>();
  private static volatile JsonNode specs;
  private static volatile JsonNode catalog;

  private AuthoringResources() {}

  /** The resource of {@code uri}, or null. */
  public static Resource byUri(String uri) {
    return RESOURCES.stream().filter(r -> r.uri().equals(uri)).findFirst().orElse(null);
  }

  /** The text of a packaged file. */
  public static String text(String file) {
    return TEXTS.computeIfAbsent(file, AuthoringResources::read);
  }

  /** The parsed {@code specs-schema.json}. */
  public static JsonNode specsSchema(ObjectMapper om) {
    var s = specs;
    if (s == null) {
      specs = s = parse(om, "specs-schema.json");
    }
    return s;
  }

  /** The parsed {@code uidl-catalog.json}. */
  public static JsonNode catalog(ObjectMapper om) {
    var c = catalog;
    if (c == null) {
      catalog = c = parse(om, "uidl-catalog.json");
    }
    return c;
  }

  private static JsonNode parse(ObjectMapper om, String file) {
    try {
      return om.readTree(text(file));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private static String read(String file) {
    var loader = AuthoringResources.class.getClassLoader();
    try (InputStream in = loader.getResourceAsStream(CLASSPATH_DIR + file)) {
      if (in == null) {
        throw new IllegalStateException(
            "The authoring resource " + CLASSPATH_DIR + file + " is not on the classpath");
      }
      return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }
}
