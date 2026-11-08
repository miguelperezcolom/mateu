package io.mateu.explorer.examples.archetypes.editableview;

import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.NotEmpty;

/**
 * The {@code EditableView} archetype ({@code AutoEditableView<T>} is the one-model variant): a
 * read-only view with an Edit button that flips into an editor (Save / Cancel) and back — in place,
 * without leaving the page. You supply {@link #load} and {@link #persist}.
 */
public class WallLabelView extends AutoEditableView<WallLabelView.WallLabel> {

  public static class WallLabel {
    @NotEmpty public String title = "Water Lilies";
    public String artist = "Claude Monet, 1906";
    public String text = "The horizon has gone: only water, reflected sky and the flowers remain.";
  }

  /** In-memory store, for the demo. */
  static WallLabel stored = new WallLabel();

  @Override
  public WallLabel load(HttpRequest httpRequest) {
    return stored;
  }

  @Override
  public void persist(WallLabel label, HttpRequest httpRequest) {
    stored = label;
  }
}
