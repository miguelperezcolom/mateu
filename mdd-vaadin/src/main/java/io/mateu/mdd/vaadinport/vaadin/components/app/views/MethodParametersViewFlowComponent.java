package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.MethodParametersViewComponent;

import java.lang.reflect.Method;

public class MethodParametersViewFlowComponent extends VerticalLayout {

    private final Method method;
    private final Object instance;
    private final MDDExecutionContext context;

    @Override
    public String toString() {
        String t = Helper.capitalize(method.getName());
        if (method.isAnnotationPresent(Action.class)) t = method.getAnnotation(Action.class).value();
        return "Parameters for " + t;
    }



    public MethodParametersViewFlowComponent(String state, Method method, Object instance, MDDExecutionContext context) {
        this.instance = instance;
        this.method = method;
        this.context = context;

        addStyleName("actionparametersflowcomponent");

        addComponent(new MethodParametersViewComponent(instance, method, context));

    }

}
