package io.mateu.explorer.examples.components.chat;

import io.mateu.uidl.data.MessageInput;
import io.mateu.uidl.data.MessageList;
import io.mateu.uidl.data.MessageListItem;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * The two building blocks for a conversation you run YOURSELF (no agent endpoint): a {@link
 * MessageList} of messages and a {@link MessageInput} whose submit runs its {@code actionId} with
 * the text in {@code message}. The messages are this view's state.
 */
public class VisitorBook implements ComponentTreeSupplier {

  /** One message: who and what. */
  public record Entry(String user, String text, String time) {}

  List<Entry> entries =
      new ArrayList<>(
          List.of(
              new Entry("Ana", "The Klimt room is breathtaking.", "10:02"),
              new Entry("Tom", "Please open the café earlier on Sundays!", "11:15")));

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .fullWidth(true)
        .content(
            List.of(
                MessageList.builder()
                    .items(
                        entries.stream()
                            .map(
                                e ->
                                    MessageListItem.builder()
                                        .userName(e.user())
                                        .text(e.text())
                                        .time(e.time())
                                        .userColorIndex(Math.abs(e.user().hashCode()) % 6)
                                        .build())
                            .toList())
                    .build(),
                MessageInput.builder().actionId("post").build()))
        .build();
  }

  public VisitorBook post(HttpRequest httpRequest) {
    var text = (String) httpRequest.runActionRq().parameters().get("message");
    var copy = new ArrayList<>(entries);
    copy.add(new Entry("You", text, LocalTime.now().withSecond(0).withNano(0).toString()));
    entries = copy;
    return this;
  }
}
