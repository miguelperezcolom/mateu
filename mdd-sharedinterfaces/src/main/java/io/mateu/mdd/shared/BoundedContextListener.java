package io.mateu.mdd.shared;

import java.util.List;

public interface BoundedContextListener {

    void init();

    void contextInitialized();

    void contextDestroyed();

    List<Command> getCommands();

    void registerEventConsumers();
}
