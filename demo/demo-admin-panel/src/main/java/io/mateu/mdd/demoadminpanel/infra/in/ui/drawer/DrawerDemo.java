package io.mateu.mdd.demoadminpanel.infra.in.ui.drawer;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.SubscriptionSource;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerPosition;
import io.mateu.uidl.data.State;

/**
 * Demo of the {@link Drawer} overlay: a toolbar action opens a second form in a side panel; saving
 * inside it closes the drawer with {@code UICommand.closeModal("contact-saved", payload)}, and this
 * page — subscribed to that event — reloads itself in place with the fresh data.
 */
@UI("/drawer-demo")
@Title("Ficha de contacto")
@SubscribeTo(event = "contact-saved", action = "load", source = SubscriptionSource.DOCUMENT)
public class DrawerDemo {

  @Section("Contacto")
  @PlainText
  String nombre = ContactHolder.nombre;

  @PlainText
  String email = ContactHolder.email;

  @Toolbar
  @Label("Editar en drawer")
  Drawer editContact() {
    return Drawer.builder()
        .id("contact-drawer")
        .headerTitle("Editar contacto")
        .position(DrawerPosition.end)
        .width("28rem")
        .content(new ContactEditDrawerForm())
        .build();
  }

  @SuppressWarnings("unused")
  @Action
  Object load() {
    nombre = ContactHolder.nombre;
    email = ContactHolder.email;
    return new State(this);
  }
}
