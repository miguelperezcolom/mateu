package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Content of the "Introducir cobro" dialog opened from the Folios / Anticipos toolbar: an amount
 * (and an optional concept) + a Charge button. Confirming registers the charge on the reservation
 * (via {@link FolioService}: it increases the deposit and reduces the outstanding balance),
 * refreshes the check-in form in place and closes the dialog.
 *
 * <p>Server-side and interactive ({@link ComponentTreeSupplier} + {@link ActionHandler}); the
 * reservation id rides in the action id so it survives the fresh re-instantiation of the dialog.
 */
@Service
public class ChargeDialog implements ComponentTreeSupplier, ActionHandler {

    private static final String CHARGE_PREFIX = "register-charge:";

    private final FolioService folioService;

    private String reservationId;

    public ChargeDialog(FolioService folioService) {
        this.folioService = folioService;
    }

    /** Seed the dialog for a reservation. */
    public ChargeDialog load(String reservationId) {
        this.reservationId = reservationId;
        return this;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("")
                .content(List.of(
                        FormField.builder()
                                .id("amount")
                                .label("Importe del cobro")
                                .dataType(FieldDataType.number)
                                .autofocus(true)
                                .build(),
                        FormField.builder()
                                .id("concept")
                                .label("Concepto")
                                .dataType(FieldDataType.string)
                                .build(),
                        Button.builder()
                                .label("Cobrar")
                                .actionId(CHARGE_PREFIX + reservationId)
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if (actionId != null && actionId.startsWith(CHARGE_PREFIX)) {
            var rid = actionId.substring(CHARGE_PREFIX.length());
            var amount = FolioService.toBigDecimal(httpRequest.runActionRq().componentState().get("amount"));
            if (amount == null || amount.signum() <= 0) {
                return Message.builder()
                        .variant(NotificationVariant.warning)
                        .text("Introduzca un importe válido")
                        .build();
            }
            folioService.addCharge(rid, amount);
            return List.of(
                    Message.success("Cobro de " + amount.toPlainString() + " registrado"),
                    UICommand.dispatchEvent("checkin-confirmed", Map.of("reservationId", rid)),
                    UICommand.builder().type(UICommandType.CloseModal).build()
            );
        }
        return null;
    }
}
