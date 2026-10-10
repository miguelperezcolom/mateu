package io.mateu.sample1.app.patterns;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.RecordSwitcher;
import io.mateu.uidl.data.SwitcherType;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RecordSwitcherSupplier;
import java.util.List;

/**
 * Pattern gaps showcase: the header record switcher (Redwood selectObject), section affordances
 * (edit / add / view more) and a backend announcement.
 */
@UI("/patterns/switcher")
@Title("Customer")
public class SwitcherPage implements RecordSwitcherSupplier {

  record Customer(String id, String name, String city, String segment) {}

  static final List<Customer> CUSTOMERS =
      List.of(
          new Customer("c1", "Ada Lovelace", "London", "Enterprise"),
          new Customer("c2", "Grace Hopper", "New York", "Public sector"),
          new Customer("c3", "José Martí", "La Habana", "SMB"));

  public String customer = "c1";

  @Section(value = "Contact", editAction = "editContact")
  public String name = "Ada Lovelace";

  public String city = "London";

  @Section(value = "Segment", addAction = "addTag", viewMoreAction = "allActivity")
  public String segment = "Enterprise";

  @Override
  public RecordSwitcher switcher(HttpRequest httpRequest) {
    return RecordSwitcher.builder()
        .options(
            CUSTOMERS.stream()
                .map(c -> new Option(c.id(), c.name(), c.city()))
                .toList())
        .value(customer)
        .type(SwitcherType.object)
        .label("Customer")
        .searchable(true)
        .build();
  }

  @Override
  public Object switchTo(String value, HttpRequest httpRequest) {
    var picked = CUSTOMERS.stream().filter(c -> c.id().equals(value)).findFirst().orElseThrow();
    customer = picked.id();
    name = picked.name();
    city = picked.city();
    segment = picked.segment();
    return List.of(this, UICommand.announce("Showing " + picked.name()));
  }

  public Object editContact() {
    return Message.success("Edit contact");
  }

  public Object addTag() {
    return UICommand.announce("Tag added");
  }

  public Object allActivity() {
    return Message.success("All activity");
  }
}
