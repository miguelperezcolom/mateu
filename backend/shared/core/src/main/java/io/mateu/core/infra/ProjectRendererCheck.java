package io.mateu.core.infra;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.mateu.core.application.runaction.MountRegistry;
import io.mateu.uidl.data.ProjectRenderer;
import io.mateu.uidl.data.ProjectSettings;
import java.io.InputStream;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.extern.slf4j.Slf4j;

/**
 * Reads the project descriptor ({@code specs/ui/project.yaml}, {@code type: Project}) and compares
 * the renderer it declares with the one this server actually SERVES.
 *
 * <p>For a served app the Maven dependency stays the source of truth — whichever renderer jar
 * ({@code io.mateu:mateu-vaadin} or {@code io.mateu:mateu-redwood}) is on the classpath is what the
 * index page boots. The descriptor is what the visual editor, Play and the static bundle paint
 * with, so when the two disagree the app a developer designed is not the app a user gets: that is
 * worth one clear WARN at startup, never a failure (a team may well serve Vaadin while trying
 * Redwood out in the editor).
 *
 * <p>Which renderer the classpath serves is read off its static resources: the Redwood jar ships a
 * Visual Builder app under {@code static/_redwood/}, the Vaadin one only {@code static/_index.html}
 * + {@code static/assets/}.
 */
@Slf4j
public final class ProjectRendererCheck {

  /** A resource only the Redwood (Visual Builder) jar ships. */
  static final String REDWOOD_MARKER = "static/_redwood/app-flow.json";

  /** The SPA template every renderer jar ships. */
  static final String INDEX_TEMPLATE = "static/_index.html";

  private static final AtomicBoolean CHECKED = new AtomicBoolean();
  private static final ObjectMapper YAML = new ObjectMapper(new YAMLFactory());

  /**
   * Dev mode: an edited descriptor is checked again (the check is once per JVM otherwise). Held
   * strongly here because {@link io.mateu.core.infra.dev.DevSpecs} registers caches weakly.
   */
  private static final io.mateu.core.infra.dev.SpecsCache RECHECK = () -> CHECKED.set(false);

  static {
    io.mateu.core.infra.dev.DevSpecs.register(RECHECK);
  }

  private ProjectRendererCheck() {}

  /**
   * The project's descriptor, when it has one: {@code specs/ui/project.yaml}, else the first {@code
   * type: Project} file under {@code specs/ui/**}. Empty when there is none — which means the
   * defaults ({@link ProjectSettings#defaults()}), but also that nothing was DECLARED.
   */
  public static Optional<ProjectSettings> read(ClassLoader classLoader) {
    var cl =
        io.mateu.core.infra.dev.DevSpecs.classLoader(
            classLoader != null ? classLoader : ProjectRendererCheck.class.getClassLoader());
    var conventional = parse(cl, ProjectSettings.CONVENTIONAL_PATH);
    if (conventional.isPresent()) {
      return conventional;
    }
    var found = new MountRegistry().projectDescriptors(cl);
    if (found.size() > 1) {
      log.warn(
          "More than one project descriptor (type: Project) on the classpath: {} — using the first."
              + " A project has one, at {}.",
          found,
          ProjectSettings.CONVENTIONAL_PATH);
    }
    return found.isEmpty() ? Optional.empty() : parse(cl, found.get(0));
  }

  /** Parses one descriptor resource; empty when it is absent or not a {@code type: Project}. */
  static Optional<ProjectSettings> parse(ClassLoader cl, String resourcePath) {
    try (InputStream is = cl.getResourceAsStream(resourcePath)) {
      if (is == null) {
        return Optional.empty();
      }
      return parse(new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8));
    } catch (Exception e) {
      log.warn("Could not read the project descriptor {}: {}", resourcePath, e.getMessage());
      return Optional.empty();
    }
  }

  /** Parses descriptor text; empty when it is not a {@code type: Project} document. */
  public static Optional<ProjectSettings> parse(String yaml) {
    try {
      var root = YAML.readTree(yaml);
      if (root == null
          || !root.isObject()
          || !ProjectSettings.TYPE.equals(root.path("type").asText(null))) {
        return Optional.empty();
      }
      var declared = root.path("renderer").asText(null);
      var renderer = ProjectRenderer.parse(declared);
      if (declared != null && renderer == null) {
        log.warn(
            "The project descriptor names an unknown renderer '{}' (expected one of {}); reading it"
                + " as {}.",
            declared,
            java.util.Arrays.toString(ProjectRenderer.values()),
            ProjectRenderer.vaadin);
      }
      return Optional.of(new ProjectSettings(renderer));
    } catch (Exception e) {
      log.warn("Could not parse the project descriptor: {}", e.getMessage());
      return Optional.empty();
    }
  }

  /**
   * The renderer this classpath serves, or {@code null} when it serves none (a headless backend: an
   * API behind a separately deployed frontend).
   */
  public static ProjectRenderer served(ClassLoader classLoader) {
    var cl = classLoader != null ? classLoader : ProjectRendererCheck.class.getClassLoader();
    if (cl.getResource(REDWOOD_MARKER) != null) {
      return ProjectRenderer.redwood;
    }
    if (cl.getResource(INDEX_TEMPLATE) != null) {
      return ProjectRenderer.vaadin;
    }
    return null;
  }

  /**
   * The warning to log, or empty when there is nothing to say: no descriptor (nothing declared), no
   * renderer served (headless), or both agree.
   */
  public static Optional<String> mismatch(ProjectSettings declared, ProjectRenderer served) {
    if (declared == null || served == null || declared.renderer() == served) {
      return Optional.empty();
    }
    var wanted = declared.renderer();
    return Optional.of(
        "The project descriptor ("
            + ProjectSettings.CONVENTIONAL_PATH
            + ") says renderer: "
            + wanted
            + ", but this server serves "
            + served
            + " ("
            + served.coordinates()
            + " is on the classpath). The served app follows the Maven dependency, so it will NOT"
            + " look like what the visual editor, Play and the static bundle show. Depend on "
            + wanted.coordinates()
            + " instead of "
            + served.coordinates()
            + ", or set renderer: "
            + served
            + " in the descriptor.");
  }

  /** Runs the check once per JVM and logs a WARN on a mismatch. Never throws. */
  public static void warnOnce(ClassLoader classLoader) {
    if (!CHECKED.compareAndSet(false, true)) {
      return;
    }
    try {
      var declared = read(classLoader).orElse(null);
      mismatch(declared, served(classLoader)).ifPresent(log::warn);
    } catch (RuntimeException e) {
      log.debug("Project renderer check skipped: {}", e.getMessage());
    }
  }

  /** Test hook: let the next {@link #warnOnce} run again. */
  static void reset() {
    CHECKED.set(false);
  }
}
