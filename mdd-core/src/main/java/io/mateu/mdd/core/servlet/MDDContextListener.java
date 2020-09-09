package io.mateu.mdd.core.servlet;

import io.mateu.mdd.util.mail.EmailHelper;
import io.mateu.mdd.util.Helper;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class MDDContextListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        Helper.loadProperties();

        if ("false".equalsIgnoreCase(System.getProperty("sendemails")) || "no".equalsIgnoreCase(System.getProperty("sendemails")) || "not".equalsIgnoreCase(System.getProperty("sendemails"))) EmailHelper.setTesting(true);
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {

    }

}
