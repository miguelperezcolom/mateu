package io.mateu.explorer.examples.behaviour.runjs;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;

/**
 * {@code @Action(js = "…")} (and the {@code RunJS} rule action) run JavaScript STATEMENTS in the
 * browser. They need {@code new Function} — {@code 'unsafe-eval'} in a Content Security Policy — so
 * RunJS is OFF by default: the statement is skipped with a console warning. An action with
 * {@code js} is client-side only — its method is never called. A page opts in with {@code <meta name="mateu-allow-run-js" content="true">}.
 * Everything else (rules, conditions, {@code ${…}}) is an expression, evaluated in a sandbox that
 * needs no opt-in.
 */
@Title("RunJS")
public class RunJsDemo {

  String note = "untouched";

  @Button
  @Label("Change the note with JS")
  @Action(js = "state.note = 'changed by RunJS'")
  void changeNote() {
    // never called: an action with js runs in the browser only
  }
}
