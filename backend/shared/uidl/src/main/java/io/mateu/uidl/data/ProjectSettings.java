package io.mateu.uidl.data;

/**
 * The project descriptor ({@code specs/ui/project.yaml}, {@code type: Project}): the settings that
 * are true of the whole PROJECT rather than of one mount or one page — today, the renderer.
 *
 * <pre>
 * type: Project
 * renderer: redwood   # vaadin | redwood
 * </pre>
 *
 * <p>One per project; absent means {@link ProjectRenderer#vaadin}. Who reads it: the visual editor
 * (its canvas and Play open in this renderer), the static bundle goal (it bundles this renderer's
 * static app) and the IDE settings (they edit this file — the file is the truth). A SERVED app is
 * different: the renderer jar on its classpath decides what it serves, and the server only warns at
 * startup when that disagrees with this file.
 *
 * @param renderer the renderer the project paints with; {@code null} reads as {@link
 *     ProjectRenderer#vaadin}
 */
public record ProjectSettings(ProjectRenderer renderer) {

  /** The {@code type} discriminator of the descriptor file. */
  public static final String TYPE = "Project";

  /** Where the descriptor lives, relative to the classpath / the project's resources root. */
  public static final String CONVENTIONAL_PATH = "specs/ui/project.yaml";

  public ProjectSettings {
    renderer = renderer == null ? ProjectRenderer.vaadin : renderer;
  }

  /** What a project with no descriptor gets. */
  public static ProjectSettings defaults() {
    return new ProjectSettings(ProjectRenderer.vaadin);
  }
}
