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
import java.util.Map;

/**
 * Editable form for the "Datos Empresa" tab, shown in a dialog. Saving persists the company data
 * to the reservation (via {@link ClientDataService}), refreshes the check-in form in place and
 * closes the dialog.
 *
 * <p>Server-side and interactive ({@link ComponentTreeSupplier} + {@link ActionHandler}); the
 * reservation id rides in the action id so it survives the fresh re-instantiation of the dialog.
 */
@Service
public class CompanyDataDialog implements ComponentTreeSupplier, ActionHandler {

    private static final String SAVE_PREFIX = "save-company:";

    private final ClientDataService clientDataService;

    private String reservationId;
    private String companyName;
    private String cif;
    private String billingEmail;
    private String fiscalAddress;
    private String paymentTerms;

    public CompanyDataDialog(ClientDataService clientDataService) {
        this.clientDataService = clientDataService;
    }

    /** Seed the dialog with the reservation and its current company data. */
    public CompanyDataDialog load(String reservationId, String companyName, String cif,
                                  String billingEmail, String fiscalAddress, String paymentTerms) {
        this.reservationId = reservationId;
        this.companyName = companyName;
        this.cif = cif;
        this.billingEmail = billingEmail;
        this.fiscalAddress = fiscalAddress;
        this.paymentTerms = paymentTerms;
        return this;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("")
                .content(List.of(
                        text("companyName", "Razón social", companyName),
                        text("cif", "CIF", cif),
                        text("billingEmail", "Email facturación", billingEmail),
                        text("fiscalAddress", "Dirección fiscal", fiscalAddress),
                        text("paymentTerms", "Forma de pago", paymentTerms),
                        Button.builder().label("Grabar").actionId(SAVE_PREFIX + reservationId).build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if (actionId != null && actionId.startsWith(SAVE_PREFIX)) {
            var rid = actionId.substring(SAVE_PREFIX.length());
            var state = httpRequest.runActionRq().componentState();
            clientDataService.updateCompany(rid,
                    str(state, "companyName"), str(state, "cif"), str(state, "billingEmail"),
                    str(state, "fiscalAddress"), str(state, "paymentTerms"));
            return List.of(
                    Message.success("Datos de empresa actualizados"),
                    UICommand.dispatchEvent("checkin-confirmed", Map.of("reservationId", rid)),
                    UICommand.builder().type(UICommandType.CloseModal).build()
            );
        }
        return null;
    }

    private static String str(Map<String, Object> state, String key) {
        var v = state.get(key);
        return v == null ? null : v.toString();
    }

    private static FormField text(String id, String label, String value) {
        return FormField.builder()
                .id(id).label(label).dataType(FieldDataType.string).initialValue(value).build();
    }
}
