package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.core.application.runaction.YamlUidlLoader;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * "Chat → screen" on the Redwood/VB renderer: open the AI assistant (the chat FAB), ask for a screen
 * in plain language, and the screen appears IN THIS PAGE — exactly like the Vaadin demo. The chat's
 * agent authors a Mateu definition (YAML) and emits a {@code render-screen} event; the VB shell's
 * {@code chatSend} chain reroutes it to this page, which runs {@link #renderScreen} and returns the
 * generated component AS the page (so it renders through the standard form path on every renderer).
 */
@UI("/ai-screen")
@Title("Chat → screen")
@SubscribeTo(event = "render-screen", action = "renderScreen")
public class ChatGenerate {

  @PlainText
  String hint =
      "💬  Open the assistant (bottom-right) and ask for a screen — e.g. \"a hotel check-in screen\".";

  @Action
  public Object renderScreen(HttpRequest httpRequest) {
    Object raw =
        httpRequest.runActionRq() != null
            ? httpRequest.runActionRq().parameters().get("yaml")
            : null;
    String yaml = raw != null ? String.valueOf(raw) : null;
    if (yaml != null && !yaml.isBlank()) {
      try {
        return new YamlUidlLoader().parseText(yaml);
      } catch (Exception ignore) {
        // keep the hint on a bad payload
      }
    }
    return this;
  }
}
