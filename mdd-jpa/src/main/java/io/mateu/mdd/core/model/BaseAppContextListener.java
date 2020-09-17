package io.mateu.mdd.core.model;

import io.mateu.mdd.core.eventBus.EventBus;
import io.mateu.mdd.core.model.authentication.UserCreatedEventConsumer;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.model.population.Populator;
import io.mateu.mdd.shared.AppContextListener;
import io.mateu.mdd.shared.BoundedContextListener;
import io.mateu.mdd.shared.Command;
import io.mateu.mdd.shared.ScheduledCommand;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.JPAHelper;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

public class BaseAppContextListener implements AppContextListener {

    public BaseAppContextListener() {
    }

    @Override
    public void init() {
    }


    @Override
    public void registerEventConsumers() {
        EventBus.register(new UserCreatedEventConsumer());
    }

    @Override
    public void initialized() {
        try {
            Helper.getImpls(BoundedContextListener.class).stream().forEach(c -> c.contextInitialized());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public boolean isPopulationNeeded() {
        try {
            return JPAHelper.find(AppConfig.class, 1l) == null;
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return true;
    }

    @Override
    public void populate() throws Throwable {
        new Populator().populate(AppConfig.class);
    }

    @Override
    public void destroyed() {
        System.out.println("app destroyed");
    }

    @Override
    public List<Command> getCommands() {
        return null;
    }

}
