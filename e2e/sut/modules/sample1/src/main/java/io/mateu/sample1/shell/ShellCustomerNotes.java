package io.mateu.sample1.shell;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

/** The second tab (child route) of {@link ShellCustomerMaster}. */
@Title("Customer notes")
@Getter
@Setter
public class ShellCustomerNotes {

  String customerId;

  String notes;

  @Button
  public Message whichCustomerNotes() {
    return new Message("notes of " + customerId);
  }
}
