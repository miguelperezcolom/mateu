package io.mateu.sample1.shell;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

/**
 * One screen answering several routes of shell-routes.yaml: {@code orders/pending} pins {@code
 * status} (fixedParams), {@code orders} only seeds it (defaultParams, overridable by the query).
 */
@Title("Orders")
@Getter
@Setter
public class ShellOrders {

  String status;

  @Button
  public Message showStatus() {
    return new Message("status=" + status);
  }
}
