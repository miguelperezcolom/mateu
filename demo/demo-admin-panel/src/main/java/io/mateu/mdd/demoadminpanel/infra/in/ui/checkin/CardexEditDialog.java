package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Editable form for the cardex, shown in a dialog. Saving updates the currently shown cardex (the
 * {@link CardexView} holder) and re-emits "pax-selected" so the embedded cardex panel reloads with
 * the edited data, then closes the dialog.
 *
 * <p>Server-side and interactive ({@link ComponentTreeSupplier} + {@link ActionHandler}). The whole
 * edited cardex is read back from the component state via {@code getComponentState(Cardex.class)}
 * (the form field ids match the {@link Cardex} property names).
 */
@Service
public class CardexEditDialog implements ComponentTreeSupplier, ActionHandler {

    private static final String SAVE_PREFIX = "save-cardex:";
    private static final String SEP = "||";

    private String reservationId;
    private String guestFullName;
    private Cardex cardex = Cardex.builder().build();

    /** Seed the dialog with the reservation and the named guest's current cardex. */
    public CardexEditDialog load(String reservationId, String guestFullName) {
        this.reservationId = reservationId;
        this.guestFullName = guestFullName;
        this.cardex = MateuBeanProvider.getBean(CardexService.class).cardexOf(reservationId, guestFullName);
        return this;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("")
                .content(List.of(
                        text("fullName", "Titular", cardex.getFullName()),
                        text("email", "Email", cardex.getEmail()),
                        text("phoneFax", "Teléfono / Fax", cardex.getPhoneFax()),
                        text("fullAddress", "Dirección", cardex.getFullAddress()),
                        text("natLang", "Nac. / Idioma", cardex.getNatLang()),
                        text("dobSex", "F. nacimiento", cardex.getDobSex()),
                        text("docInfo", "Documento", cardex.getDocInfo()),
                        text("riuClassNo", "Nº Riu Class", cardex.getRiuClassNo()),
                        text("acceptsAds", "Acepta publicidad", cardex.getAcceptsAds()),
                        bool("companion", "Acompañante", cardex.isCompanion()),
                        bool("provisionalCardex", "Cardex provisional", cardex.isProvisionalCardex()),
                        // The reservation id + the guest identity ride in the action id so they
                        // survive the dialog's fresh re-instantiation, and the persist targets the
                        // right pax even if the user edits the displayed name.
                        Button.builder().label("Grabar")
                                .actionId(SAVE_PREFIX + reservationId + SEP + guestFullName).build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if (actionId != null && actionId.startsWith(SAVE_PREFIX)) {
            var payload = actionId.substring(SAVE_PREFIX.length());
            var sep = payload.indexOf(SEP);
            var rid = sep >= 0 ? payload.substring(0, sep) : payload;
            var guestFullName = sep >= 0 ? payload.substring(sep + SEP.length()) : null;
            var edited = httpRequest.getComponentState(Cardex.class);
            // Persist onto the specific guest, and update the in-memory display holder.
            MateuBeanProvider.getBean(CardexService.class).saveCardex(rid, guestFullName, edited);
            CardexView.prime(edited);
            return List.of(
                    Message.success("Cardex actualizado"),
                    // Reload only the embedded cardex panel with the edited data.
                    UICommand.dispatchEvent("pax-selected", edited),
                    UICommand.builder().type(UICommandType.CloseModal).build()
            );
        }
        return null;
    }

    private static FormField text(String id, String label, String value) {
        return FormField.builder()
                .id(id).label(label).dataType(FieldDataType.string).initialValue(value).build();
    }

    private static FormField bool(String id, String label, boolean value) {
        return FormField.builder()
                .id(id).label(label).dataType(FieldDataType.bool).initialValue(value).build();
    }
}
