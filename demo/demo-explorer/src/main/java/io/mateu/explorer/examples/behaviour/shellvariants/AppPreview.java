package io.mateu.explorer.examples.behaviour.shellvariants;

import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * Explorer plumbing, not an example: shows a small app (its own {@code @UI} mount) inside the
 * entry page, in a frame, with a link to open it on its own. App-level behaviour — the shell, its
 * menu, its home, its keys — belongs to a whole app, so each such entry mounts one.
 */
public abstract class AppPreview implements ComponentTreeSupplier {

  /** The mount's base path, e.g. {@code /x/behaviour/shell-tabs}. */
  protected abstract String mount();

  protected String height() {
    return "26rem";
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return frame(mount(), height());
  }

  /** A framed app with a link to open it on its own. */
  public static Component frame(String mount, String height) {
    return VerticalLayout.builder()
        .fullWidth(true)
        .content(
            List.of(
                new Anchor("Open this app on its own ↗", mount, "_blank", null, null),
                new Element(
                    "iframe",
                    Map.of("src", mount, "title", "App preview: " + mount),
                    Map.of(),
                    "",
                    "width: 100%; height: " + height + "; border: 1px solid var(--lumo-contrast-20pct, #ccc); border-radius: 8px;",
                    "")))
        .build();
  }
}
