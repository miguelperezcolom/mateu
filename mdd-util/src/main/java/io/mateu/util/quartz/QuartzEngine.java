package io.mateu.util.quartz;

import io.mateu.mdd.shared.Command;
import io.mateu.mdd.shared.ScheduledCommand;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

public class QuartzEngine {

    private Scheduler scheduler;
    protected HashMap<String, Command> scheduledCommands = new HashMap<>();

    public static QuartzEngine instance;

    public static QuartzEngine get() {
        if (instance == null) {
            instance = new QuartzEngine();
            instance.init();
        }
        return instance;
    }

    public static void runAndSchedule(List<Command> commands) {
        get()._runAndSchedule(commands);
    }

    public static void run(String uuid) {
        get()._run(uuid);
    }

    private void _run(String uuid) {
        try {
            scheduledCommands.get(uuid).run();
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
    }

    private void _runAndSchedule(List<Command> commands) {
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
                    try {
                        c.run();
                    } catch (Throwable throwable) {
                        throwable.printStackTrace();
                    }
                }
            });
        }
    }

    private void init() {
        try {
            // Grab the Scheduler instance from the Factory
            scheduler = StdSchedulerFactory.getDefaultScheduler();
            // and start it off
            scheduler.start();
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
    }

    public static void destroy() {
        get()._destroy();
    }

    private void _destroy() {
        try {
            scheduler.shutdown();
        } catch (SchedulerException e) {
            e.printStackTrace();
        }
    }
}
