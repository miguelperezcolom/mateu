package io.mateu.sample1.chat;

import io.mateu.uidl.annotations.AI;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/**
 * An app with the AI chat whose agent is a stub the spec answers in the browser (a relative
 * {@code sse} url the test intercepts): backs chat-render-screen.spec.ts — a {@code render-screen}
 * with no page subscribed to it is rendered by the shell itself (content, drawer, dialog), one a
 * page subscribes to is that page's, and {@code navigation-requested} navigates.
 */
@UI("/chat-lab")
@Title("Chat lab")
@App(AppVariant.MENU_ON_TOP)
@AI(sse = "/chat-lab-agent/stream")
public class ChatLabApp {

  @Menu ChatLabPlainPage plain;

  @Menu ChatLabSubscribedPage subscribed;

  @Menu ChatLabTargetPage target;
}
