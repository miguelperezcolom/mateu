package io.mateu.sample1;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.SeparatorBefore;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toc;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.TextSize;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/**
 * Walkthrough fixture for the section-level layout features on one long, stacked page: the
 * sections index ({@code @Toc}), a frameless band, a pinned (sticky) section, a property list, a
 * single-column section on a two-column form, section affordances (edit / add / view more), a
 * separator, a tab strip with a default-open tab and keyboard shortcuts, and sized text.
 */
@UI("/walk-layout")
@Title("Layout walk")
@Toc
@Getter
@Setter
public class LayoutWalkForm {

  @Section(value = " ", frameless = true)
  @Text(size = TextSize.xl)
  String banner = "Booking R-001";

  @Section(value = " ", frameless = true)
  @Notice(theme = "warning")
  String warning = "Arrives late";

  @Section(value = "Guests", sticky = true)
  String leadGuest = "Ana Pérez";

  @Section(value = "Guests", sticky = true)
  int adults = 2;

  @Section(value = "Document", propertyList = true)
  String docType = "Passport";

  @Section(value = "Document", propertyList = true)
  String docNumber = "X1234567";

  @Section(value = "Document", propertyList = true)
  LocalDate expiry = LocalDate.of(2030, 5, 1);

  @Section(value = "Contact", columns = 1)
  @Stereotype(FieldStereotype.email)
  String email = "ana@example.com";

  @Section(value = "Contact", columns = 1)
  String phone = "+34 600 000 000";

  @Section(
      value = "Address",
      editAction = "editAddress",
      addAction = "addAddress",
      viewMoreAction = "moreAddress")
  String street = "Gran Via 1";

  @Section(
      value = "Address",
      editAction = "editAddress",
      addAction = "addAddress",
      viewMoreAction = "moreAddress")
  String city = "Madrid";

  @Section(
      value = "Address",
      editAction = "editAddress",
      addAction = "addAddress",
      viewMoreAction = "moreAddress")
  @SeparatorBefore
  String zip = "28013";

  @Section("Preferences")
  @Tab(value = "Room", shortcut = "alt+1")
  String roomType = "Double";

  @Section("Preferences")
  @Tab(value = "Diet", open = true, shortcut = "alt+2")
  String diet = "Vegetarian";

  @Section("Preferences")
  @Tab(value = "Extras", shortcut = "alt+3")
  String extras = "Late checkout";

  @Section("Notes")
  @Stereotype(FieldStereotype.textarea)
  String notes = "Quiet room please";

  @Section("History")
  String history = "3 previous stays";

  @Action
  public Message editAddress() {
    return new Message("edit address");
  }

  @Action
  public Message addAddress() {
    return new Message("add address");
  }

  @Action
  public Message moreAddress() {
    return new Message("more address");
  }

  @Button
  public Message echo() {
    return new Message(
        "echo: adults="
            + adults
            + " diet="
            + diet
            + " extras="
            + extras
            + " zip="
            + zip
            + " docNumber="
            + docNumber);
  }
}
