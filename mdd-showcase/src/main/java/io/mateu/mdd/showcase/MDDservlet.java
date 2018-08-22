package io.mateu.mdd.showcase;


import com.vaadin.annotations.VaadinServletConfiguration;
import com.vaadin.server.VaadinServlet;
import io.mateu.mdd.vaadinport.vaadin.MDDUI;

import javax.servlet.annotation.WebServlet;

@WebServlet(urlPatterns = "/*", name = "MyUIServlet", asyncSupported = true, loadOnStartup = 1000)
@VaadinServletConfiguration(ui = MDDUI.class, productionMode = false)
public class MDDservlet extends VaadinServlet {
}
