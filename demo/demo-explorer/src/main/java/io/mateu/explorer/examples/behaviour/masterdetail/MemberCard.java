package io.mateu.explorer.examples.behaviour.masterdetail;

import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalTime;

/**
 * The detail island. It subscribes to {@code member-selected} and, when it fires, loads that member
 * and returns its own new state — only this island repaints. The "rendered at" time shows it.
 */
@SubscribeTo(event = "member-selected", action = "show")
public class MemberCard implements ComponentTreeSupplier {

  String name = "Pick someone in the grid";
  String role = "";
  String bio = "";
  String renderedAt = LocalTime.now().withNano(0).toString();

  @Override
  public Component component(HttpRequest httpRequest) {
    return Card.builder()
        .title(new Text("${state.name}"))
        .content(
            new VerticalLayout(
                new Text("${state.role}"),
                new Text("${state.bio}"),
                new Text("detail rendered at ${state.renderedAt}")))
        .build();
  }

  public State show(HttpRequest httpRequest) {
    var id = String.valueOf(httpRequest.runActionRq().parameters().get("id"));
    Team.MEMBERS.stream()
        .filter(m -> m.id().equals(id))
        .findFirst()
        .ifPresent(
            m -> {
              name = m.name();
              role = m.role();
              bio = m.bio();
            });
    renderedAt = LocalTime.now().withNano(0).toString();
    return new State(this);
  }
}
