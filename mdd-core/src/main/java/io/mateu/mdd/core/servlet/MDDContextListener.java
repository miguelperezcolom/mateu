package io.mateu.mdd.core.servlet;

import io.mateu.util.SharedHelper;
import io.mateu.mdd.shared.Command;
import io.mateu.util.app.MateuApplication;
import io.mateu.util.mail.EmailHelper;
import org.quartz.*;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.util.HashMap;

@WebListener
public class MDDContextListener implements ServletContextListener {

    private Scheduler scheduler;
    protected static HashMap<String, Command> scheduledCommands = new HashMap<>();
    private MateuApplication app;

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        SharedHelper.loadProperties();

        if ("false".equalsIgnoreCase(System.getProperty("sendemails")) || "no".equalsIgnoreCase(System.getProperty("sendemails")) || "not".equalsIgnoreCase(System.getProperty("sendemails"))) EmailHelper.setTesting(true);

        app = new MateuApplication().start();
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {
        app.destroy();
    }





}
