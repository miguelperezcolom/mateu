package com.example.demo.infra.in.ui;

import io.mateu.core.application.runaction.YamlUidlLoader;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.concurrent.Callable;

/**
 * The content view of the "chat → screen" demo: subscribed to the {@code render-screen} event the AI
 * chat emits, it parses the YAML the agent authored and renders it IN THE PAGE through the normal
 * pipeline. The chat itself + the @AI wiring live on the app shell {@link AssistantApp} (an @App must
 * be a pure shell — a class mixing @App with content fields renders as a page, so the FAB never shows).
 */
@Title("Chat → screen")
@SubscribeTo(event = "render-screen", action = "renderScreen")
public class ChatGenerate {

  private transient Component generated;

  @Colspan(2)
  public Callable<Component> screen = this::render;

  /** Runs when the chat emits render-screen; the event detail (the YAML) arrives in the action's
   *  parameters map (that is where a @SubscribeTo delivers event.detail — not query params).
   *  Returns {@code this} so the view re-renders in place with the freshly generated screen.
   *  {@code @Action} advertises it in the component's actions so the chat's event can dispatch it. */
  @Action
  public Object renderScreen(HttpRequest httpRequest) {
    Object raw = httpRequest.runActionRq() != null ? httpRequest.runActionRq().parameters().get("yaml") : null;
    String yaml = raw != null ? String.valueOf(raw) : null;
    if (yaml != null && !yaml.isBlank()) {
      try {
        generated = new YamlUidlLoader().parseText(yaml);
      } catch (Exception ignore) {
        // leave the previous screen in place on a bad payload
      }
    }
    return this;
  }

  private Component render() {
    return generated != null
        ? generated
        : new YamlUidlLoader()
            .parseText(
                "type: Text\n"
                    + "text: \"💬  Open the assistant (bottom-right) and ask for a screen — e.g. 'a hotel check-in screen'.\"\n"
                    + "size: l");
  }
}
