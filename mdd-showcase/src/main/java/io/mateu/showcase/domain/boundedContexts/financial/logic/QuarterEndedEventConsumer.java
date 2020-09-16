package io.mateu.showcase.domain.boundedContexts.financial.logic;

import io.mateu.mdd.util.JPAHelper;
import io.mateu.showcase.domain.events.QuarterEndedEvent;

import java.util.function.Consumer;

public class QuarterEndedEventConsumer implements Consumer<QuarterEndedEvent> {
    @Override
    public void accept(QuarterEndedEvent event) {
        try {
            JPAHelper.transact(em -> {
                //todo: facturar pedidos
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }
}
