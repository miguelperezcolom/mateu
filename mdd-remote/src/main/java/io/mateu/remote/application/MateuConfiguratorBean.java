package io.mateu.remote.application;

import io.mateu.reflection.ReflectionHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;


@Service
public class MateuConfiguratorBean implements io.mateu.mdd.springboot.BeanProvider {

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

}