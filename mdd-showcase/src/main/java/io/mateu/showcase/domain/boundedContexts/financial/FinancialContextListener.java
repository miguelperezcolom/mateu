package io.mateu.showcase.domain.boundedContexts.financial;

import io.mateu.mdd.core.eventBus.EventBus;
import io.mateu.mdd.shared.Command;
import io.mateu.mdd.shared.BoundedContextListener;
import io.mateu.showcase.domain.boundedContexts.financial.logic.QuarterStartedEventConsumer;

import java.util.List;

public class FinancialContextListener implements BoundedContextListener {
    @Override
    public void init() {

    }

    @Override
    public void contextInitialized() {

    }

    @Override
    public void contextDestroyed() {

    }

    @Override
    public List<Command> getCommands() {
        return null;
    }

    @Override
    public void registerEventConsumers() {
        EventBus.register(new QuarterStartedEventConsumer());
    }
}
