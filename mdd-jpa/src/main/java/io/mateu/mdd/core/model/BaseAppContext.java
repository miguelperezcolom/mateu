package io.mateu.mdd.core.model;

import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.model.population.Populator;
import io.mateu.mdd.shared.AppContextListener;
import io.mateu.mdd.shared.BoundedContextListener;
import io.mateu.mdd.shared.Command;
import io.mateu.mdd.shared.ScheduledCommand;
import io.mateu.mdd.util.Helper;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

public class BaseAppContext implements AppContextListener {
    private Scheduler scheduler;

    protected static HashMap<String, Command> scheduledCommands = new HashMap<>();

    @Override
    public void init() {
        try {
            Helper.getImpls(BoundedContextListener.class).stream().forEach(c -> c.init());
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (isPopulationNeeded()) {
            try {
                populate();
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }
    }

    @Override
    public void initialized() {
        try {
            Helper.getImpls(BoundedContextListener.class).stream().forEach(c -> c.contextInitialized());
        } catch (Exception e) {
            e.printStackTrace();
        }

        try {
            // Grab the Scheduler instance from the Factory
            scheduler = StdSchedulerFactory.getDefaultScheduler();
            // and start it off
            scheduler.start();
        } catch (SchedulerException e) {
            e.printStackTrace();
        }


        runAndSchedule(getCommands());
        try {
            Helper.getImpls(BoundedContextListener.class).stream().forEach(c -> runAndSchedule(c.getCommands()));
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    private void runAndSchedule(List<Command> commands) {
        if (commands != null) {
            commands.stream().forEach(c -> {
                if (c instanceof ScheduledCommand) {
                    // define the job and tie it to our HelloJob class
                    String uuid = UUID.randomUUID().toString();
                    scheduledCommands.put(uuid, c);
                    JobDetail job = JobBuilder.newJob(MateuJob.class)
                            .withIdentity("job-" + uuid, "io.mateu")
                            .usingJobData("_commandId", uuid)
                            .build();

                    // Trigger the job to run now, and then repeat every 40 seconds
                    Trigger trigger = TriggerBuilder.newTrigger()
                            .withIdentity("trigger-" + uuid, "io.mateu")
                            .startNow()
//                            .withSchedule(CronScheduleBuilder.cronSchedule("0 0/2 8-17 * * ?"))
//                            .withSchedule(SimpleScheduleBuilder.simpleSchedule()
//                                    .withIntervalInSeconds(40)
//                                    .repeatForever())
                            .withSchedule(CronScheduleBuilder.cronSchedule(((ScheduledCommand) c).getSchedule()))
                            .build();

                    // Tell quartz to schedule the job using our trigger
                    try {
                        scheduler.scheduleJob(job, trigger);
                    } catch (SchedulerException e) {
                        e.printStackTrace();
                    }
                } else {
                    c.run();
                }
            });
        }
    }

    @Override
    public boolean isPopulationNeeded() {
        try {
            return Helper.find(AppConfig.class, 1l) != null;
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
        try {
            scheduler.shutdown();
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<Command> getCommands() {
        return null;
    }
}
