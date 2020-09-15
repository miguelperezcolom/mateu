package io.mateu.showcase.domain.boundedContexts.financial.logic;

import io.mateu.mdd.util.Helper;
import io.mateu.showcase.domain.events.QuarterEndedEvent;

import java.util.function.Consumer;

public class QuarterEndedEventConsumer implements Consumer<QuarterEndedEvent> {
    @Override
    public void accept(QuarterEndedEvent event) {
        try {
            Helper.transact(em -> {
                //todo: facturar pedidos
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }
}
