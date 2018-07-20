package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.Button;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.MyUI;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.CRUDViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.MethodParametersViewComponent;

import java.lang.reflect.Method;

public class MethodParametersViewFlowComponent extends VerticalLayout {

    private final Method method;
    private final Object instance;

    @Override
    public String toString() {
        String t = Helper.capitalize(method.getName());
        if (method.isAnnotationPresent(Action.class)) t = method.getAnnotation(Action.class).name();
        return "Parameters for " + t;
    }



    public MethodParametersViewFlowComponent(String state, Method method, Object instance) {
        this.instance = instance;
        this.method = method;


        addStyleName("actionparametersflowcomponent");

        addComponent(new MethodParametersViewComponent(instance, method));

    }

}
