package io.mateu.sample1.shell;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

/**
 * One order, at {@code orders/:id} of shell-routes.yaml — the {@code :param} neighbour of the
 * pinned {@code orders/pending}, which must keep answering {@code /shell/orders/pending} (a literal
 * segment beats a parameter, on the server and in the browser).
 */
@Title("Order")
@Getter
@Setter
public class ShellOrder {

  String id;

  @Button
  public Message whichOrder() {
    return new Message("order " + id);
  }
}
