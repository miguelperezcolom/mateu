package io.mateu.mdd.springboot;

import io.mateu.mdd.vaadin.VaadinResourcesServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.stereotype.Service;

@Service
public class VaadinResourceServletBean extends ServletRegistrationBean {

    public VaadinResourceServletBean() {
        super(new VaadinResourcesServlet(), "/VAADIN", "/VAADIN/*");
    }

}
