package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;

/**
 * A section's own actions — {@code @Section(addAction, editAction, viewMoreAction)}. On Redwood
 * they are Spectra's section affordances (oj-sp-section: add as its primary action, edit, view
 * more), not buttons inside the section.
 */
@UI("/section-actions")
@Title("Section actions")
public class SectionActionsPage {

  @Section(
      value = "Address",
      addAction = "addAddress",
      editAction = "editAddress",
      viewMoreAction = "moreAddress")
  String street = "Gran Via 1";

  @Section(
      value = "Address",
      addAction = "addAddress",
      editAction = "editAddress",
      viewMoreAction = "moreAddress")
  String city = "Madrid";

  @Section("Notes")
  String notes = "No section actions here.";

  public Message addAddress() {
    return new Message("Add address");
  }

  public Message editAddress() {
    return new Message("Edit address");
  }

  public Message moreAddress() {
    return new Message("More about the address");
  }
}
