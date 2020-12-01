package io.mateu.quarkus;

import io.mateu.mdd.vaadin.VaadinResourcesServlet;
import io.mateu.util.persistence.JPAHelper;

import javax.inject.Inject;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.annotation.WebServlet;

@WebServlet(urlPatterns = {"/VAADIN", "/VAADIN/*"}, initParams = {
        @WebInitParam(name = "org.atmosphere.websocket.suppressJSR356", value = "true")})
public class VaadinServlet extends VaadinResourcesServlet {

    @Inject
    JPAQuarkusHelperImpl i;

    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        super.init(servletConfig);
        JPAHelper.set(i);
    }
}
