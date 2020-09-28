package io.mateu.mdd.vaadin;


import com.vaadin.annotations.VaadinServletConfiguration;
import com.vaadin.server.DeploymentConfiguration;
import com.vaadin.server.VaadinServlet;

import javax.servlet.annotation.WebServlet;
import java.util.Properties;

@WebServlet(urlPatterns = {"/VAADIN", "/VAADIN/*"}, name = "VaadinResourcesServlet", asyncSupported = true, loadOnStartup = 500)
@VaadinServletConfiguration(ui = MDDUI.class, productionMode = false)
public class VaadinResourcesServlet extends VaadinServlet {

    @Override
    protected DeploymentConfiguration createDeploymentConfiguration(Properties initParameters) {

        if ("true".equals(System.getProperty("productionMode"))) initParameters.setProperty("productionMode", Boolean.toString(true));

        return super.createDeploymentConfiguration(initParameters);
    }


}



