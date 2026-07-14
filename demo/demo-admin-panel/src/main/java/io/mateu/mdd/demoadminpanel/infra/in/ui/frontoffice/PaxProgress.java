package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.TaskProgress;
import io.mateu.uidl.fluent.Component;

/** Demo of the {@link TaskProgress} component: registered pax of a reservation. */
@UI("/task-progress-demo")
@Title("Pax progress")
public class PaxProgress {

  @Section("Huéspedes")
  Component pax =
      TaskProgress.builder()
          .label("Reserva con 4 pax. Registrar huéspedes adicionales.")
          .total(4)
          .done(1)
          .actionLabel("Añadir siguiente pax")
          .actionId("addPax")
          .build();

  @Action
  Object addPax() {
    return new Message("This would open the next guest's registration form");
  }
}
