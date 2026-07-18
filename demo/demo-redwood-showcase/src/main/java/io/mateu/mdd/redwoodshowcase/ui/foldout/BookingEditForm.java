package io.mateu.mdd.redwoodshowcase.ui.foldout;

import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Small editable form shown inside the Foldout overview's Edit dialog (vertical config). The
 * {@code @NotEmpty} field drives the client-side error check; save closes the dialog and refreshes.
 */
public class BookingEditForm {

  @NotEmpty String guestName = "Jane Smith";

  String status = "Confirmed";

  @Toolbar
  public List<Object> save() {
    return List.of(Message.success("Booking saved"), UICommand.closeModal());
  }

  @Toolbar
  public UICommand cancel() {
    return UICommand.closeModal();
  }
}
