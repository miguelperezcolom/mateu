package io.mateu.mdd.showcase;


import com.vaadin.annotations.VaadinServletConfiguration;
import com.vaadin.server.DeploymentConfiguration;
import com.vaadin.server.VaadinServlet;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import java.util.Properties;

@WebServlet(urlPatterns = "/*", name = "MyUIServlet", asyncSupported = true, loadOnStartup = 1000)
@VaadinServletConfiguration(ui = MDDUI.class, productionMode = false)
public class MDDservlet extends VaadinServlet {

    @Override
    protected DeploymentConfiguration createDeploymentConfiguration(Properties initParameters) {

        if ("true".equals(System.getProperty("productionMode"))) initParameters.setProperty("productionMode", Boolean.toString(true));

        return super.createDeploymentConfiguration(initParameters);
    }

}



