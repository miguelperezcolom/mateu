package io.mateu.explorer.examples.components.drawer;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerPosition;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * A {@link Drawer} is the side-panel sibling of a dialog: returned from an action, it slides in
 * from an edge over the page. Its options: {@code position} (start, end, bottom), {@code size} (s,
 * m, l, xl — or an explicit {@code width}), {@code subtitle}, {@code maximizable} (a ⤢ button that
 * steps the size up), {@code collapsible} (a bottom drawer that folds to its header), {@code
 * modeless} (no backdrop).
 */
public class DrawerExamples implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return HorizontalLayout.builder()
        .spacing(true)
        .wrap(true)
        .content(
            List.of(
                button("Details (end, maximizable)", "openDetails"),
                button("Filters (start, small)", "openFilters"),
                button("Activity (bottom, collapsible)", "openActivity"),
                button("Notes (modeless)", "openNotes")))
        .build();
  }

  static Button button(String label, String actionId) {
    return Button.builder().label(label).actionId(actionId).build();
  }

  public Drawer openDetails() {
    return Drawer.builder()
        .headerTitle("The Starry Night")
        .subtitle("Vincent van Gogh · 1889")
        .size(DrawerSize.m)
        .maximizable(true)
        .content(
            VerticalLayout.builder()
                .content(
                    List.of(
                        new Text("Oil on canvas, 73.7 × 92.1 cm."),
                        new Text("Acquired through the Lillie P. Bliss Bequest, 1941."),
                        new Text("Press ⤢ in the header to make the drawer bigger.")))
                .build())
        .footer(
            HorizontalLayout.builder()
                .content(List.of(button("Close", "closeDrawer"), button("Save and close", "saveAndClose")))
                .build())
        .build();
  }

  public Drawer openFilters() {
    return Drawer.builder()
        .headerTitle("Filters")
        .position(DrawerPosition.start)
        .size(DrawerSize.s)
        .content(new Text("A start drawer slides in from the left — a good home for filters."))
        .build();
  }

  public Drawer openActivity() {
    return Drawer.builder()
        .headerTitle("Activity log")
        .position(DrawerPosition.bottom)
        .collapsible(true)
        .content(
            VerticalLayout.builder()
                .content(
                    List.of(
                        new Text("10:02 · Condition report saved"),
                        new Text("09:41 · Loan request approved"),
                        new Text("09:15 · Photograph uploaded")))
                .build())
        .build();
  }

  public Drawer openNotes() {
    return Drawer.builder()
        .headerTitle("Notes")
        .modeless(true)
        .width("20rem")
        .content(new Text("No backdrop: the page behind stays usable while this is open."))
        .build();
  }

  public List<Object> closeDrawer() {
    return List.of(UICommand.closeModal());
  }

  public List<Object> saveAndClose() {
    return List.of(UICommand.closeModal(), Message.success("Saved"));
  }
}
