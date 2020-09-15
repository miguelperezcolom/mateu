package io.mateu.showcase.domain.events;

import io.mateu.mdd.core.eventBus.Event;
import lombok.Getter;

@Getter
public class InvoiceCreatedEvent implements Event {

    private final long invoiceId;

    public InvoiceCreatedEvent(long invoiceId) {
        this.invoiceId = invoiceId;
    }
}
