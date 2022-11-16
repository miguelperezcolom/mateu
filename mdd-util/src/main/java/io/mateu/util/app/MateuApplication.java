package io.mateu.util.app;

import io.mateu.util.eventBus.EventBus;
import io.mateu.util.quartz.QuartzEngine;
import io.mateu.util.SharedHelper;
import io.mateu.mdd.shared.AppContextListener;
import io.mateu.mdd.shared.BoundedContextListener;
import io.mateu.mdd.shared.Command;
import org.quartz.Scheduler;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.util.Arrays;
import java.util.HashMap;


public class MateuApplication {

    private Scheduler scheduler;
    protected static HashMap<String, Command> scheduledCommands = new HashMap<>();

    public MateuApplication start() {
        _start();
        return this;
    }

    @PostConstruct
    private void _start() {
        init();
        started();
    }

    private void init() {
        SharedHelper.loadProperties();
        try {
            SharedHelper.getImpls(AppContextListener.class).stream().forEach(c -> c.init());
            SharedHelper.getImpls(BoundedContextListener.class).stream().forEach(c -> c.init());
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            SharedHelper.getImpls(AppContextListener.class).stream().forEach(c -> c.registerEventConsumers());
            SharedHelper.getImpls(BoundedContextListener.class).stream().forEach(c -> c.registerEventConsumers());
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            SharedHelper.getImpls(AppContextListener.class).stream().forEach(c -> {
                if (c.isPopulationNeeded()) {
                    try {
                        c.populate();
                    } catch (Throwable throwable) {
                        throwable.printStackTrace();
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }

        Runtime.getRuntime().addShutdownHook(new Thread(new ShutdownHookThread(this)));
    }

    private void started() {

        try {
            SharedHelper.getImpls(AppContextListener.class).stream().forEach(c -> QuartzEngine.runAndSchedule(c.getCommands()));
            SharedHelper.getImpls(BoundedContextListener.class).stream().forEach(c -> QuartzEngine.runAndSchedule(c.getCommands()));
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    public void run(Command... commands) {
        init();
        QuartzEngine.runAndSchedule(Arrays.asList(commands));
        destroy();
    }

    @PreDestroy
    public void destroy() {

        try {
            SharedHelper.getImpls(AppContextListener.class).stream().forEach(c -> c.destroyed());
            SharedHelper.getImpls(BoundedContextListener.class).stream().forEach(c -> c.contextDestroyed());
        } catch (Exception e) {
            e.printStackTrace();
        }

        QuartzEngine.destroy();

        EventBus.shutdown();

    }

}
