package io.mateu.explorer.examples.behaviour.i18n;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;

/**
 * Java labels use the same catalogues: {@code ${i18n.key}} inside any label, title or text the
 * default translator handles. The built-in texts (validation messages, the chrome) follow the same
 * locale.
 */
@Title("${i18n.explorer.i18n.title}")
public class Greeting {

  @Label("${i18n.explorer.i18n.name}")
  @NotEmpty
  String name;

  @Button
  @Label("${i18n.explorer.i18n.greet}")
  Message greet() {
    return new Message("👋 " + name);
  }
}
