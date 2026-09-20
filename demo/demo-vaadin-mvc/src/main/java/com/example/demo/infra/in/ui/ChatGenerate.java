package com.example.demo.infra.in.ui;

import io.mateu.core.application.runaction.YamlUidlLoader;
import io.mateu.uidl.annotations.AI;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.concurrent.Callable;

/**
 * "Chat → screen": the built-in Mateu AI chat ({@link AI}) is the interface. You ask it for a screen;
 * the agent authors the Mateu definition (YAML) and emits a {@code render-screen} event carrying it;
 * this view is subscribed to that event and renders the parsed definition IN THE PAGE through the
 * normal pipeline. Point {@code @AI(sse=…)} at the local agent (frontend/promo/local-agent.mjs), which
 * delegates the authoring to the deployed LLM.
 */
@UI("chat")
@App
@Title("Chat → screen")
@AI(sse = "http://localhost:8777/agent/stream")
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
