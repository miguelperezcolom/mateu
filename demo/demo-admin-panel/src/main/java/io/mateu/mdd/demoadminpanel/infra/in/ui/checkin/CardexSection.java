package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * "Info Cardex" section for {@link CheckInFormV2} (formerly a tab of ClientInfoSection). Embeds the
 * independent {@link CardexView} component (which reloads itself when a guest row is selected) and
 * carries the "Editar cardex" action.
 */
@PlainText
public class CardexSection {

    @Hidden String id;

    @Label("")
    @Inline
    CardexView cardex = new CardexView();

    @Toolbar
    @Action(shortcut = "ctrl+alt+k")
    @Label("Editar cardex")
    Object editCardex(HttpRequest httpRequest) {
        // The pax to edit = the selected guest row (reliably carried in the form state), or the lead.
        var selected = httpRequest.getSelectedRows("guestList-guests", GuestData.class)
                .stream().findFirst().orElse(null);
        var service = MateuBeanProvider.getBean(CardexService.class);
        var guest = service.resolveGuest(id, selected);
        var guestFullName = guest != null ? CardexService.fullName(guest) : null;
        return Dialog.builder()
                .headerTitle("Editar cardex")
                .width("520px")
                .closeButtonOnHeader(true)
                .content(MateuBeanProvider.getBean(CardexEditDialog.class).load(id, guestFullName))
                .build();
    }

    void populate(ReservationLine line) {
        id = line.getId();
    }
}
