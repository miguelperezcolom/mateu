package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DialogDto;
import io.mateu.dtos.DrawerDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.EmbeddedView;
import io.mateu.uidl.data.ModelViewComponent;
import io.mateu.uidl.data.UICommand;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A form opened in a dialog or a drawer is a component of its own: it carries its own state, and
 * its buttons run its own methods.
 *
 * <p>A {@link ModelViewComponent} draws its view as part of the component around it — right for a
 * piece of a page, wrong for an overlay: the form's state never reached the browser (its fields
 * came up empty) and its buttons went to the page behind, which knows nothing of them. And an
 * {@link EmbeddedView}, which is what gets it right, handed the view object itself to the JSON
 * serialiser as its state — so a field without a getter did not travel either.
 */
class OverlayFormSyncTest {

  /** A form with no getters: its state has to travel as any page's does, field by field. */
  public static class CancellationForm {
    String bookingIds;
    String reason = "CLI";

    public CancellationForm() {}

    CancellationForm(String bookingIds) {
      this.bookingIds = bookingIds;
    }

    @Toolbar
    UICommand cancelBookings() {
      return UICommand.closeModal();
    }
  }

  @SuppressWarnings("unused")
  @UI("/overlay-forms")
  public static class Host {
    String name = "n";

    @Action
    Dialog dialogWithModelView() {
      return Dialog.builder()
          .content(new ModelViewComponent(new CancellationForm("79RE8S")))
          .build();
    }

    @Action
    Drawer drawerWithModelView() {
      return Drawer.builder()
          .content(new ModelViewComponent(new CancellationForm("79RE8S")))
          .build();
    }

    @Action
    Dialog dialogWithEmbeddedView() {
      return Dialog.builder().content(new EmbeddedView(new CancellationForm("79RE8S"))).build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Host.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static Object overlayContent(String actionId) {
    UIIncrementDto increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/overlay-forms")
                .actionId(actionId)
                .serverSideType(Host.class.getName())
                .initiatorComponentId("cmp-1")
                .componentState(Map.of("name", "n"))
                .build());
    var overlay = (ClientSideComponentDto) increment.fragments().get(0).component();
    return switch (overlay.metadata()) {
      case DialogDto dialog -> dialog.content();
      case DrawerDto drawer -> drawer.content();
      default -> throw new AssertionError("not an overlay: " + overlay.metadata());
    };
  }

  @SuppressWarnings("unchecked")
  private static void assertIsTheFormsOwnComponent(Object content) {
    assertThat(content).isInstanceOf(ServerSideComponentDto.class);
    var form = (ServerSideComponentDto) content;
    assertThat(form.serverSideType()).isEqualTo(CancellationForm.class.getName());
    assertThat((Map<Object, Object>) form.initialData())
        .containsEntry("bookingIds", "79RE8S")
        .containsEntry("reason", "CLI");
    assertThat(form.actions()).extracting(ActionDto::id).contains("cancelBookings");
  }

  @Test
  void aFormInADialogIsItsOwnComponentWithItsStateAndItsActions() {
    assertIsTheFormsOwnComponent(overlayContent("dialogWithModelView"));
  }

  @Test
  void aFormInADrawerIsItsOwnComponentWithItsStateAndItsActions() {
    assertIsTheFormsOwnComponent(overlayContent("drawerWithModelView"));
  }

  @Test
  void anEmbeddedViewCarriesItsStateWithoutGetters() {
    assertIsTheFormsOwnComponent(overlayContent("dialogWithEmbeddedView"));
  }
}
