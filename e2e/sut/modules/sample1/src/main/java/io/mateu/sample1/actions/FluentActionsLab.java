package io.mateu.sample1.actions;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Action ids named by components rather than by annotated methods: a fluent {@code Button} with an
 * id inside a Card and inside a Tab, a {@code MetricCard}, an {@code EmptyState} CTA and a {@code
 * Notice} action. Each id has a public method here, so the view advertises it (the tree-referenced
 * id rule) and the click reaches the server; {@code last} shows which one ran.
 */
@UI("/fluent-actions-lab")
public class FluentActionsLab implements ComponentTreeSupplier {

  String last = "none";

  @Override
  public Component component(HttpRequest httpRequest) {
    return new VerticalLayout(
        new Text("last", "Last: ${state.last}"),
        Card.builder().content(new Button("In a card", "cardAction")).build(),
        TabLayout.builder()
            .tabs(
                List.of(
                    new Tab("First tab", new Button("In a tab", "tabAction")),
                    new Tab("Second tab", new Text("second"))))
            .build(),
        new HorizontalLayout(
            MetricCard.builder()
                .id("metric")
                .title("Open orders")
                .value("42")
                .actionId("metricAction")
                .build(),
            EmptyState.builder()
                .id("empty")
                .title("Nothing here yet")
                .actionLabel("Create one")
                .actionId("emptyAction")
                .build()),
        Notice.builder()
            .id("notice")
            .text("2 complaints pending")
            .theme("warning")
            .actionLabel("Review")
            .actionId("noticeAction")
            .build());
  }

  public State cardAction() {
    return ran("card");
  }

  public State tabAction() {
    return ran("tab");
  }

  public State metricAction() {
    return ran("metric");
  }

  public State emptyAction() {
    return ran("empty state");
  }

  public State noticeAction() {
    return ran("notice");
  }

  private State ran(String what) {
    last = what;
    return new State(this);
  }
}
