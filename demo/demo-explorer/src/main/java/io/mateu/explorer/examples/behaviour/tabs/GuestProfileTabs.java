package io.mateu.explorer.examples.behaviour.tabs;

import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;

/**
 * {@code @Tab("Name")} puts the field in a tab; consecutive fields with the same name share it.
 * {@code open = true} makes a tab the initial selection (instead of the first declared) and {@code
 * shortcut} selects it from the keyboard — in place, with no server round trip.
 */
@Title("Guest profile")
public class GuestProfileTabs {

  @Tab(value = "Identity", shortcut = "alt+1")
  String name = "Ada Lovelace";

  @Tab(value = "Identity", shortcut = "alt+1")
  String nationality = "British";

  @Tab(value = "Contact", shortcut = "alt+2", open = true)
  String email = "ada@example.com";

  @Tab(value = "Contact", shortcut = "alt+2", open = true)
  String phone = "+44 20 0000 0000";

  @Tab(value = "Preferences", shortcut = "alt+3")
  String pillow = "Feather";
}
