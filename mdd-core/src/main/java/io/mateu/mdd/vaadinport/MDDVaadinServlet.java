package io.mateu.mdd.vaadinport;


import com.vaadin.annotations.VaadinServletConfiguration;
import com.vaadin.server.DeploymentConfiguration;
import com.vaadin.server.VaadinServlet;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import javax.servlet.annotation.WebServlet;
import java.util.Properties;

@WebServlet(urlPatterns = {"/app", "/app/*", "/VAADIN", "/VAADIN/*"}, name = "MyUIServlet", asyncSupported = true, loadOnStartup = 500)
@VaadinServletConfiguration(ui = MDDUI.class, productionMode = false)
public class MDDVaadinServlet extends VaadinServlet {

    @Override
    protected DeploymentConfiguration createDeploymentConfiguration(Properties initParameters) {

        if ("true".equals(System.getProperty("productionMode"))) initParameters.setProperty("productionMode", Boolean.toString(true));

        return super.createDeploymentConfiguration(initParameters);
    }

}



