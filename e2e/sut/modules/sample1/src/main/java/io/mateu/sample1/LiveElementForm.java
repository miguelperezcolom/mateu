package io.mateu.sample1;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.State;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

/**
 * Fixture for a custom element that has to keep up with a view refreshing itself.
 *
 * <p>The shape is the one a live monitoring page has: most of what the page shows is values, and
 * one thing on it is a web component fed from the server — a diagram, a gauge, a map. The page
 * refreshes with a {@link State}, which carries VALUES and does not resend the component tree, so
 * anything the element receives as a literal attribute is frozen as of the render that built it.
 * Written as an expression the attribute is a value like any other, and follows every refresh.
 *
 * <p>The tag is deliberately not a real component: what is asserted is what ARRIVES at it, which
 * is all the framework is responsible for, and the picture a real one would paint is identical
 * either way — which is exactly how this kind of bug stays unnoticed.
 */
@UI("/live-element")
@Title("Live element")
@Getter
@Setter
public class LiveElementForm {

  String step = "one";

  Element diagram =
      Element.builder()
          .name("live-graph")
          .attributes(Map.of("overlay", "${state.step}"))
          .content("")
          .style("display: block; height: 4rem;")
          .build();

  @Button
  @Label("Advance")
  public Object advance() {
    step = "two";
    return new State(this);
  }
}
