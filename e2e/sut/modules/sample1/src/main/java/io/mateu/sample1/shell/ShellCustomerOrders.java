package io.mateu.sample1.shell;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

/** A tab (child route) of {@link ShellCustomerMaster}: receives the master's path parameter. */
@Title("Customer orders")
@Getter
@Setter
public class ShellCustomerOrders {

  String customerId;

  @Button
  public Message whichCustomer() {
    return new Message("orders of " + customerId);
  }
}
