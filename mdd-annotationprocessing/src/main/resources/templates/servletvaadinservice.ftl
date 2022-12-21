package com.example.demo;
import io.mateu.mdd.vaadin.VaadinResourcesServlet;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import javax.annotation.PostConstruct;
import io.mateu.reflection.ReflectionHelper;




@Service
public class MyUIServletVaadinService extends ServletRegistrationBean implements io.mateu.mdd.springboot.BeanProvider {

    @Autowired
    private ApplicationContext сontext;


    @PostConstruct
    public void postConstruct() {
        ReflectionHelper.setBeanProvider(this);
    }

    public Object getBean(Class c) {
        Object o = null;
        try {
            o = сontext.getBean(c);
        } catch (Exception e) {

        }
        return o;
    }

    public MyUIServletVaadinService() {
        super(new VaadinResourcesServlet(), "/VAADIN", "/VAADIN/*");
    }
}
