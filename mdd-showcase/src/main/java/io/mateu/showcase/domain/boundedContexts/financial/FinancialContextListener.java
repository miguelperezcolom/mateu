package io.mateu.showcase.domain.boundedContexts.financial;

import io.mateu.mdd.core.eventBus.EventBus;
import io.mateu.mdd.shared.ContextListener;
import io.mateu.showcase.domain.boundedContexts.financial.logic.QuarterStartedEventConsumer;

public class FinancialContextListener implements ContextListener {
    @Override
    public void contextInitialized() {
        EventBus.register(new QuarterStartedEventConsumer());
    }

    @Override
    public void contextDestroyed() {

    }
}
