package io.mateu.mdd.demoadminpanel.infra.in.ui.tabs;

import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Tabs;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * Demo of per-tab keyboard shortcuts via {@code @Tab(shortcut=...)}. Press <kbd>alt+1</kbd> /
 * <kbd>alt+2</kbd> / <kbd>alt+3</kbd> to jump between tabs without the mouse. The shortcut syntax is
 * the same as {@code @Action(shortcut=...)}.
 */
@UI("/tabs-shortcuts")
@Title("Tabs with keyboard shortcuts")
@Tabs
public class TabsShortcutDemo {

  @Tab(value = "Personal (alt+1)", shortcut = "alt+1")
  String firstName = "Miguel";

  @Tab(value = "Personal (alt+1)", shortcut = "alt+1")
  String lastName = "Pérez";

  @Tab(value = "Address (alt+2)", shortcut = "alt+2")
  String street = "Gran Vía 1";

  @Tab(value = "Address (alt+2)", shortcut = "alt+2")
  String city = "Madrid";

  @Tab(value = "Billing (alt+3)", shortcut = "alt+3")
  String iban = "ES00 0000 0000 0000";

  @Tab(value = "Billing (alt+3)", shortcut = "alt+3")
  String vat = "B00000000";
}
