package io.mateu.explorer.examples.behaviour.overlayresult;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * The host page. "Add contact" opens a drawer ({@link ContactEditor}); when the drawer closes with
 * {@code UICommand.closeModal("contact-saved", payload)}, the event reaches this page through the
 * bus ({@code @SubscribeTo}) and {@link #contactSaved} runs with the payload as parameters. Closing
 * with ✕ or Esc emits nothing — the "dismissed" path.
 */
@Title("Contacts")
@SubscribeTo(event = "contact-saved", action = "contactSaved")
public class ContactsPage {

  @PlainText String lastSaved = "nobody yet";

  @PlainText Integer contacts = 0;

  @Button
  Drawer addContact() {
    return Drawer.builder()
        .headerTitle("New contact")
        .subtitle("Save sends the result back to the page")
        .content(new ContactEditor())
        .build();
  }

  public State contactSaved(HttpRequest httpRequest) {
    lastSaved = String.valueOf(httpRequest.runActionRq().parameters().get("name"));
    contacts = (contacts == null ? 0 : contacts) + 1;
    return new State(this);
  }
}
