package io.mateu.uidl.data;

/**
 * The renderer a Mateu PROJECT paints its UI with — chosen once, in {@code specs/ui/project.yaml}
 * ({@link ProjectSettings}), not page by page.
 *
 * <p>Each constant also names the Maven artifact that serves it, and this is the ONLY place that
 * mapping lives: the server's mismatch check, the static bundle goal and the IDE wizards all ask
 * {@link #artifactId()} rather than spelling the coordinates themselves, so renaming the artifacts
 * is a one-line change here.
 */
public enum ProjectRenderer {

  /** The Vaadin/Lumo web renderer — the default. Served by {@code io.mateu:vaadin-lit}. */
  vaadin("vaadin-lit"),

  /**
   * The Redwood renderer: an Oracle Visual Builder app (JET + Spectra, loaded from Oracle's CDN).
   * Served by {@code io.mateu:redwood}.
   */
  redwood("redwood");

  /** The group id every renderer artifact is published under. */
  public static final String GROUP_ID = "io.mateu";

  private final String artifactId;

  ProjectRenderer(String artifactId) {
    this.artifactId = artifactId;
  }

  /** The Maven artifact id of the jar that serves this renderer (group {@link #GROUP_ID}). */
  public String artifactId() {
    return artifactId;
  }

  /** {@code groupId:artifactId}, for messages. */
  public String coordinates() {
    return GROUP_ID + ":" + artifactId;
  }

  /** The renderer a value names (case-insensitive), or {@code null} when it names none. */
  public static ProjectRenderer parse(String value) {
    if (value == null) {
      return null;
    }
    for (var renderer : values()) {
      if (renderer.name().equalsIgnoreCase(value.trim())) {
        return renderer;
      }
    }
    return null;
  }
}
