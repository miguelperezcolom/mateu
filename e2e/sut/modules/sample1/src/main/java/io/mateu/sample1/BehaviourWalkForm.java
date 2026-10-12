package io.mateu.sample1;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/**
 * Walkthrough fixture for form behaviour: autosave, a keyboard shortcut on an action, an
 * {@code @Inline} subform with its own toolbar/button/shortcut actions, fields gated by identity
 * ({@code @EyesOnly}, {@code @ReadOnlyUnless}, {@code @DisabledUnless} — nobody is signed in on the
 * SUT, so they are hidden / read-only / disabled), a component-holder field that must stay out of
 * the state, and a {@code Double} the browser sends back as a whole number.
 */
@UI("/walk-behaviour")
@Title("Behaviour walk")
@AutoSave(debounceMillis = 300, action = "autoSave")
@Getter
@Setter
public class BehaviourWalkForm {

  @Section("Main")
  String name = "Ana";

  @Section("Main")
  Double amount = 343.0;

  @Section("Main")
  @EyesOnly(roles = "admin")
  String secretNote = "only admins";

  @Section("Main")
  @ReadOnlyUnless(roles = "admin")
  String lockedForGuests = "read only for you";

  @Section("Main")
  @DisabledUnless(roles = "admin")
  String disabledForGuests = "disabled for you";

  @Section("Address")
  @Inline
  Address address = new Address();

  /** A component holder: not data, so it must not travel in the state nor be reset by it. */
  Callable<Component> greeting = () -> new Text("Hello from a component holder");

  int autoSaves;

  public Message autoSave() {
    autoSaves++;
    return new Message("auto-saved " + name + " amount=" + amount);
  }

  @Action(shortcut = "ctrl+alt+s")
  @Button
  public Message save() {
    return new Message(
        "saved "
            + name
            + " amount="
            + amount
            + " city="
            + address.getCity()
            + " secret="
            + secretNote
            + " greeting="
            + (greeting == null ? null : "kept"));
  }

  @Getter
  @Setter
  public static class Address {
    String street = "Gran Via 1";
    String city = "Madrid";

    @Toolbar
    public Message verify() {
      return new Message("verified " + city);
    }

    @Action(shortcut = "ctrl+alt+g")
    @Button
    public Message geocode() {
      return new Message("geocoded " + street);
    }
  }
}
