package io.mateu.showcase.domain.boundedContexts.financial.logic;

import io.mateu.mdd.util.JPAHelper;
import io.mateu.showcase.domain.events.QuarterStartedEvent;

import java.util.function.Consumer;

public class QuarterStartedEventConsumer implements Consumer<QuarterStartedEvent> {
    @Override
    public void accept(QuarterStartedEvent event) {
        try {
            JPAHelper.transact(em -> {
                //todo: generar pedidos
            });
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

    }
}
