package io.mateu.explorer.ui;

import io.mateu.explorer.ui.contacts.Contacts;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/**
 * Root app of the Mateu Explorer — a Redwood-rendered shell with a menu over the demo screens. Add
 * a {@code @Menu} field pointing to any {@code @UI} screen to make it appear in the navigation.
 */
@UI("")
@Title("Mateu Explorer")
@App(value = AppVariant.MENU_ON_TOP, themeToggle = true)
public class Explorer {

  @Menu Greeting greeting;

  @Menu Contacts contacts;
}
