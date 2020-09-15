package io.mateu.showcase.domain.boundedContexts.financial.logic;

import io.mateu.mdd.util.Helper;
import io.mateu.showcase.domain.events.InvoiceCreatedEvent;

import java.util.function.Consumer;

public class InvoiceCreatedEventConsumer implements Consumer<InvoiceCreatedEvent> {
    @Override
    public void accept(InvoiceCreatedEvent event) {
        try {
            Helper.transact(em -> {
                //todo: generar pedidos
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }
}
