package io.mateu.explorer.examples.components.element;

import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * Elements that ACT and elements that LOAD: {@code on} maps a DOM event to an action of this view
 * (it receives the serialised event in {@code event}); an {@code import} attribute loads a JavaScript
 * module before the element is drawn — the way to use a third-party web component.
 */
public class ElementExamples implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .content(
            List.of(
                Element.builder()
                    .name("button")
                    .attributes(Map.of("type", "button", "style", "padding: .5rem 1rem;"))
                    .on(Map.of("click", "elementClicked", "dblclick", "elementDoubleClicked"))
                    .content("A raw <button> — click or double-click me")
                    .build(),
                Element.builder()
                    .name("explorer-museum-clock")
                    // the module that defines <explorer-museum-clock> (see MuseumClockModule.java)
                    .attributes(Map.of("import", "/explorer-api/museum-clock.js", "city", "Amsterdam"))
                    .build()))
        .build();
  }

  // a plain public method: the Element's `on:` names it, which is what advertises it
  public Message elementClicked(HttpRequest httpRequest) {
    var event = (Map<?, ?>) httpRequest.runActionRq().parameters().get("event");
    return new Message(event.get("type") + " at x=" + event.get("clientX") + ", y=" + event.get("clientY"));
  }

  public Message elementDoubleClicked() {
    return Message.success("dblclick!");
  }
}
