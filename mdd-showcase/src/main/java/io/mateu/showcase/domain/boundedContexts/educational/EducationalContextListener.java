package io.mateu.showcase.domain.boundedContexts.educational;

import io.mateu.mdd.core.eventBus.EventBus;
import io.mateu.mdd.shared.ContextListener;
import io.mateu.showcase.domain.boundedContexts.educational.logic.StudentGradedEventConsumer;

public class EducationalContextListener implements ContextListener {
    @Override
    public void contextInitialized() {
        EventBus.register(new StudentGradedEventConsumer());
    }

    @Override
    public void contextDestroyed() {

    }
}
