package io.mateu.showcase.domain.boundedContexts.educational;

import io.mateu.mdd.core.eventBus.EventBus;
import io.mateu.mdd.shared.Command;
import io.mateu.mdd.shared.BoundedContextListener;
import io.mateu.showcase.domain.boundedContexts.educational.logic.StartCourseCommand;
import io.mateu.showcase.domain.boundedContexts.educational.logic.StudentGradedEventConsumer;

import java.util.List;

public class EducationalContextListener implements BoundedContextListener {
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
        return List.of(new StartCourseCommand());
    }

    @Override
    public void registerEventConsumers() {

        EventBus.register(new StudentGradedEventConsumer());

    }
}
