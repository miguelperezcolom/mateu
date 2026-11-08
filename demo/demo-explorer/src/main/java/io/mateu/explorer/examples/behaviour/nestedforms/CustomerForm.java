package io.mateu.explorer.examples.behaviour.nestedforms;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Message;

/**
 * A field typed as another class is a NESTED form. On its own it is a sub-form in its own card;
 * with {@code @Inline} its fields are laid out directly in the parent section. The nested class
 * may carry its own actions: {@code @Toolbar} methods sit on the section's title row, {@code
 * @Button} methods under its content — and they run against the nested object.
 */
@Title("Customer")
public class CustomerForm {

  @Section("Customer")
  String name = "Ada Lovelace";

  Contact contact = new Contact();

  @Section("Billing address")
  @Inline
  Address billing = new Address();

  @Button
  Message save() {
    return Message.success(name + " · " + contact.email + " · " + billing.city);
  }

  public static class Contact {
    String email = "ada@example.com";
    String phone = "+34 600 000 000";
  }

  public static class Address {
    String street = "1 Analytical St.";
    String city = "London";

    @Toolbar
    Message validate() {
      return Message.success("Address of " + city + " validated");
    }

    @Button
    Address clear() {
      street = "";
      city = "";
      return this;
    }
  }
}
