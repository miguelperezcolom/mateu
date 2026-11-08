package io.mateu.explorer.examples.components.microfrontend;

import io.mateu.uidl.data.EmbeddedChrome;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The same page embedded with each {@code chrome}: PAGE keeps its header (minus the breadcrumb),
 * NONE drops the header altogether — a block of THIS page, not a page of its own. Inside an
 * embedded island the page cannot change the window title or the URL.
 */
public class EmbeddedChromeExamples implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                new Text("chrome = PAGE", TextContainer.h5),
                embed(EmbeddedChrome.PAGE),
                new Text("chrome = NONE", TextContainer.h5),
                embed(EmbeddedChrome.NONE)))
        .build();
  }

  static MicroFrontend embed(EmbeddedChrome chrome) {
    return MicroFrontend.builder()
        .route("/x/components/micro-frontend/exhibition")
        .chrome(chrome)
        .style("display: block; border: 1px dashed #94a3b8; border-radius: 8px; padding: .5rem;")
        .build();
  }
}
