package com.example.demo;
import com.example.demo.MyUI;
import com.vaadin.server.BootstrapFragmentResponse;
import com.vaadin.server.BootstrapListener;
import com.vaadin.server.BootstrapPageResponse;
import com.vaadin.server.DeploymentConfiguration;
import com.vaadin.server.ServiceException;
import com.vaadin.server.SessionInitEvent;
import com.vaadin.server.SessionInitListener;
import com.vaadin.server.VaadinServlet;
import io.mateu.mdd.core.annotations.MateuUIServlet;
import com.example.demo.MyUIUI;
import com.vaadin.annotations.VaadinServletConfiguration;
import com.vaadin.server.DeploymentConfiguration;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import java.util.Properties;
import javax.servlet.annotation.WebInitParam;

@WebServlet(urlPatterns = {"", "/*"}, name = "com_example_demo_MyUIUIServlet", asyncSupported = true, initParams = {
@WebInitParam(name = "org.atmosphere.websocket.suppressJSR356", value = "true")})
@VaadinServletConfiguration(ui = MyUIUI.class, productionMode = false)
@MateuUIServlet(path="")
public class MyUIServlet extends VaadinServlet implements SessionInitListener {

@Override
protected DeploymentConfiguration createDeploymentConfiguration(Properties initParameters) {
    if ("true".equals(System.getProperty("productionMode"))) {
        initParameters.setProperty("productionMode", Boolean.toString(true));
    }
    return super.createDeploymentConfiguration(initParameters);
}

@Override
public void init(ServletConfig servletConfig) throws ServletException {
servletConfig.getServletContext().setAttribute("/_app", MyUI.class);
super.init(servletConfig);
}

@Override
protected void servletInitialized() throws ServletException {
super.servletInitialized();
getService().addSessionInitListener(this);
}
@Override
public void sessionInit(SessionInitEvent sessionInitEvent) throws ServiceException {

sessionInitEvent.getSession().addBootstrapListener(new BootstrapListener() {

@Override
public void modifyBootstrapPage(BootstrapPageResponse response) {
response.getDocument().head()
.getElementsByAttributeValue("rel", "shortcut icon")
.attr("href", "https://www.wefox.com/favicons/favicon-32x32.png");
response.getDocument().head()
.getElementsByAttributeValue("rel", "icon")
.attr("href", "https://www.wefox.com/favicons/favicon-32x32.png");
}

@Override
public void modifyBootstrapFragment(BootstrapFragmentResponse response) {
}

});
}

}
