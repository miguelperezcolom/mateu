package io.mateu.mdd.core.servlet;

import io.mateu.mdd.core.util.Helper;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class MDDContextListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent servletContextEvent) {
        Helper.loadProperties();
    }

    @Override
    public void contextDestroyed(ServletContextEvent servletContextEvent) {

    }

}
