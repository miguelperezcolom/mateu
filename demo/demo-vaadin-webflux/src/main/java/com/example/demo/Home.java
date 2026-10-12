package com.example.demo;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Arrays;
import java.util.List;

/**
 * The root page of the demo: what {@code /} answers. Every demo screen is its own {@code @UI}
 * mount, so the links are plain anchors — a full page load into that mount.
 */
@UI("")
@Title("Mateu demos")
public class Home implements ComponentTreeSupplier {

  /** One entry per {@code @UI} screen this app serves. Add a line when you add a demo. */
  private static final String[][] DEMOS = {
    {
      "Counter",
      "/counter",
      "A component tree built in code: a Text bound to the state and a Button whose handler is a"
          + " lambda. Click Increment and the server answers the new count."
    },
  };

  @Override
  public Component component(HttpRequest httpRequest) {
    var demos =
        new VerticalLayout(
            Arrays.stream(DEMOS).map(demo -> card(demo[0], demo[1], demo[2])).toList());
    return new VerticalLayout(
        new Text("title", "Mateu demos", TextContainer.h1),
        new Text(
            "intro",
            "Mateu is a model-driven UI system: you declare the model once, in code or in YAML,"
                + " and Mateu renders forms, CRUDs, navigation and full app shells — no frontend"
                + " code. These are small, runnable screens served by this Spring WebFlux app.",
            TextContainer.p),
        demos,
        HorizontalLayout.builder()
            .spacing(true)
            .content(
                List.of(
                    new Anchor("Documentation", "https://mateu.io", "_blank", "", ""),
                    new Anchor(
                        "Source code",
                        "https://github.com/miguelperezcolom/mateu/tree/master/demo/demo-vaadin-webflux",
                        "_blank",
                        "",
                        "")))
            .build());
  }

  private static Component card(String name, String route, String description) {
    return Card.builder()
        .title(new Text(name))
        .content(new Text(description))
        .footer(new Anchor("Open " + name, route))
        .build();
  }
}
