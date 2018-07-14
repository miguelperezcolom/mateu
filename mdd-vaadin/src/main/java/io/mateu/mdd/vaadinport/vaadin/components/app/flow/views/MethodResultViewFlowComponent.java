package io.mateu.mdd.vaadinport.vaadin.components.app.flow.views;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.CRUDViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.MethodParametersViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.MethodResultViewComponent;

import java.lang.reflect.Method;

public class MethodResultViewFlowComponent extends AbstractFlowComponent {

   private final String state;
    private final Method method;
    private final Object result;

    @Override
    public String getViewTile() {
        String t = Helper.capitalize(method.getName());
        if (method.isAnnotationPresent(Action.class)) t = method.getAnnotation(Action.class).name();
        return "Result of " + t;
    }

    @Override
    public String getStatePath() {
        return state;
    }


    public MethodResultViewFlowComponent(String state, Method method, Object result) {
        this.state = state;
        this.result = result;
        this.method = method;


        addStyleName("methodresultflowcomponent");

        addComponent(new MethodResultViewComponent(method, result));

    }

}
