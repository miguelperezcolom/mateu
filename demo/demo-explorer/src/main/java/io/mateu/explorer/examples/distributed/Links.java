package io.mateu.explorer.examples.distributed;

import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import java.util.Arrays;
import java.util.List;

/** Small building blocks the distributed examples share: links that open in a new tab, a label. */
public final class Links {

  private Links() {}

  public static Component open(String label, String url) {
    return new Anchor(label + " ↗", url, "_blank", null, null);
  }

  public static Component row(Component... items) {
    return HorizontalLayout.builder().content(List.of(items)).spacing(true).wrap(true).build();
  }

  public static Component column(Component... items) {
    return VerticalLayout.builder().content(Arrays.asList(items)).spacing(true).fullWidth(true).build();
  }

  public static Component caption(String text) {
    return Text.builder().container(TextContainer.h4).text(text).build();
  }

  public static Component text(String text) {
    return Text.builder().container(TextContainer.p).text(text).build();
  }

  /** A box for an embedded remote screen, so it reads as a block of this page. */
  public static Component boxed(MicroFrontend microFrontend) {
    return VerticalLayout.builder()
        .content(List.of(microFrontend))
        .style(
            "width: 100%; border: 1px dashed var(--lumo-contrast-30pct, #bbb);"
                + " border-radius: 8px; padding: .5rem;")
        .build();
  }
}
