package io.mateu.explorer.ui;

import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextSize;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Shared body for the page-width demo screens: a heading + a full-width content card, so the width
 * mode (fixed / full / edge) is visually obvious against the page canvas.
 */
abstract class WidthDemoBase implements ComponentTreeSupplier {

  @Override
  public String style() {
    return null; // let the renderer's page-width container own the sizing
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .fullWidth(true)
        .spacing(true)
        .content(
            List.of(
                Text.builder().text(heading()).size(TextSize.l).build(),
                Card.builder()
                    .title(Text.builder().text("Content slab").build())
                    .content(new Markdown(body(), null, null))
                    .style("width:100%;")
                    .build()))
        .build();
  }

  abstract String heading();

  abstract String body();
}
