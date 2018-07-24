package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.ui.Component;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.MethodResultViewComponent;

import java.lang.reflect.Method;

public class MethodResultViewFlowComponent extends VerticalLayout {

    private final Method method;
    private final Object result;

    @Override
    public String toString() {
        String t = Helper.capitalize(method.getName());
        if (method.isAnnotationPresent(Action.class)) t = method.getAnnotation(Action.class).value();
        return "Result of " + t;
    }

    public MethodResultViewFlowComponent(String state, Method method, Object result) {
        this.result = result;
        this.method = method;


        addStyleName("methodresultflowcomponent");

        if (result instanceof Component) addComponent((Component) result);
        else addComponent(new MethodResultViewComponent(method, result));

    }

}
