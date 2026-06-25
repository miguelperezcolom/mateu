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

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Content of the "Límite de crédito" dialog opened from the Folios / Anticipos toolbar: a single
 * editable amount + a Save button. Confirming updates the reservation (via {@link FolioService}),
 * refreshes the check-in form in place and closes the dialog.
 *
 * <p>Server-side and interactive ({@link ComponentTreeSupplier} + {@link ActionHandler}); the
 * reservation id rides in the action id so it survives the fresh re-instantiation of the dialog.
 */
@Service
public class CreditLimitDialog implements ComponentTreeSupplier, ActionHandler {

    private static final String SAVE_PREFIX = "save-credit-limit:";

    private final FolioService folioService;

    private String reservationId;
    BigDecimal creditLimit;

    public CreditLimitDialog(FolioService folioService) {
        this.folioService = folioService;
    }

    /** Seed the dialog with the reservation and its current credit limit. */
    public CreditLimitDialog load(String reservationId, BigDecimal currentLimit) {
        this.reservationId = reservationId;
        this.creditLimit = currentLimit;
        return this;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("")
                .content(List.of(
                        FormField.builder()
                                .id("creditLimit")
                                .label("Límite de crédito")
                                .dataType(FieldDataType.number)
                                .initialValue(creditLimit)
                                .autofocus(true)
                                .build(),
                        Button.builder()
                                .label("Guardar")
                                .actionId(SAVE_PREFIX + reservationId)
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if (actionId != null && actionId.startsWith(SAVE_PREFIX)) {
            var rid = actionId.substring(SAVE_PREFIX.length());
            var limit = FolioService.toBigDecimal(httpRequest.runActionRq().componentState().get("creditLimit"));
            folioService.setCreditLimit(rid, limit);
            return List.of(
                    Message.success("Límite de crédito actualizado"),
                    UICommand.dispatchEvent("checkin-confirmed", Map.of("reservationId", rid)),
                    UICommand.builder().type(UICommandType.CloseModal).build()
            );
        }
        return null;
    }
}
