package com.example.demo.infra.in.ui;

import io.mateu.uidl.annotations.AI;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * App shell for the "chat → screen" demo: a PURE @App (no content fields) so Mateu emits the app
 * shell — the AI chat FAB ({@link AI}) and the menu. The menu opens {@link ChatGenerate}, which is
 * subscribed to the chat's render-screen event and renders the generated screen in the page.
 */
@UI("")
@App
@Title("Assistant")
@AI(sse = "http://localhost:8777/agent/stream")
public class AssistantApp {

  @Menu ChatGenerate assistant;
}
