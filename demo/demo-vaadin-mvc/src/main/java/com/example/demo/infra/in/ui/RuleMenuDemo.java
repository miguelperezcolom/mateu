package com.example.demo.infra.in.ui;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;

/**
 * Demonstrates the two menu-leaf primitives: a route (navigates) and a rule (runs client-side). The
 * {@code ping} leaf is typed {@code Rule}, so clicking it runs a RunJS rule instead of navigating —
 * here it stamps the document title so a test can observe it did NOT navigate.
 */
@UI("/rule-menu-demo")
public class RuleMenuDemo {

  @Menu String catalog = "/rule-menu-demo/catalog"; // a route leaf

  @Menu
  Rule ping =
      Rule.builder()
          .action(RuleAction.RunJS)
          .value("window.alert('Ping — a client-side rule ran, no navigation')")
          .build(); // rule leaf

  @ReadOnly String info = "Click 'Ping' to run a client-side rule (no navigation).";
}
