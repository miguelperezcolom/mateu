package io.mateu.mdd.shared;

import java.util.List;

public interface AppContextListener {

    void init();

    void registerEventConsumers();

    void initialized();

    boolean isPopulationNeeded();

    void populate() throws Throwable;

    void destroyed();

    List<Command> getCommands();

}
