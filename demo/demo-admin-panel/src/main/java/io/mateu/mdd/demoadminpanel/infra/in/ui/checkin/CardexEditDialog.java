package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
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

    private static final String SAVE = "save-cardex";

    private Cardex cardex = Cardex.builder().build();

    /** Seed the dialog with the cardex currently shown. */
    public CardexEditDialog load(Cardex current) {
        this.cardex = current != null ? current : Cardex.builder().build();
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
                        Button.builder().label("Grabar").actionId(SAVE).build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if (SAVE.equals(actionId)) {
            var edited = httpRequest.getComponentState(Cardex.class);
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
