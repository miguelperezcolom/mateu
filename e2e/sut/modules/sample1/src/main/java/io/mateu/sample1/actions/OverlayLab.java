package io.mateu.sample1.actions;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ConfirmDialog;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerPosition;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.Getter;
import lombok.Setter;

/**
 * Overlays walked end to end: a drawer whose form closes it with a RESULT the page receives
 * ({@code closeModal(event, payload)} + {@code @SubscribeTo}), a dialog opened from inside it
 * (nesting), the drawer's header extras (size, maximize, peer navigation), the bottom collapsible
 * drawer, a modeless one and a confirm dialog wired to actions.
 */
@UI("/overlay-lab")
@Title("Overlay lab")
@SubscribeTo(event = "contact-saved", action = "onSaved")
@Getter
@Setter
public class OverlayLab {

  String received = "";

  @Button
  public Drawer editContact() {
    return Drawer.builder()
        .headerTitle("Edit contact")
        .subtitle("Changes go back to the page")
        .size(DrawerSize.s)
        .maximizable(true)
        .peerNav(new PeerNav("Previous", "/overlay-lab", "Next", "/fluent-counter"))
        .content(new ContactEditor())
        .build();
  }

  @Button
  public Drawer bottomDrawer() {
    return Drawer.builder()
        .headerTitle("Bottom panel")
        .position(DrawerPosition.bottom)
        .collapsible(true)
        .content(new Text("Docked at the bottom"))
        .build();
  }

  @Button
  public Drawer modelessDrawer() {
    return Drawer.builder()
        .headerTitle("Side notes")
        .modeless(true)
        .content(new Text("The page behind stays usable"))
        .build();
  }

  @Button
  public ConfirmDialog confirmDialog() {
    return ConfirmDialog.builder()
        .header("Proceed?")
        .content(new Text("Pick one"))
        .canCancel(true)
        .canReject(true)
        .confirmText("Yes")
        .rejectText("No")
        .confirmActionId("confirmed")
        .rejectActionId("rejected")
        .build();
  }

  public OverlayLab confirmed() {
    received = "confirmed";
    return this;
  }

  public OverlayLab rejected() {
    received = "rejected";
    return this;
  }

  public OverlayLab onSaved(HttpRequest httpRequest) {
    received = "saved " + httpRequest.runActionRq().parameters().get("name");
    return this;
  }
}
