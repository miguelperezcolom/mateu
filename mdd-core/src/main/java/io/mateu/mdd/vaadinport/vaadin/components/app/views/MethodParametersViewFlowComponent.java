package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.google.common.base.Strings;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.MethodParametersViewComponent;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.MethodParametersViewComponent;

import java.lang.reflect.Method;
import java.util.Set;

public class MethodParametersViewFlowComponent extends VerticalLayout {

    private final Method method;
    private final Object instance;
    private final MDDExecutionContext context;
    private final MDDBinder binder;
    private final MethodParametersViewComponent component;
    private final Set pendingSelection;

    @Override
    public String toString() {
        String t = Helper.capitalize(method.getName());
        if (method.isAnnotationPresent(Action.class) && !Strings.isNullOrEmpty(method.getAnnotation(Action.class).value())) t = method.getAnnotation(Action.class).value();
        return t;
    }



    public MethodParametersViewFlowComponent(String state, Method method, Object instance, MDDExecutionContext context, MDDBinder binder, Set pendingSelection) {
        this.instance = instance;
        this.method = method;
        this.context = context;
        this.binder = binder;
        this.pendingSelection = pendingSelection;

        addStyleName("actionparametersflowcomponent");

        addComponent(component = new MethodParametersViewComponent(binder, instance, method, context, pendingSelection));

    }

    public Method getMethod() {
        return method;
    }

    public Object getInstance() {
        return instance;
    }

    public MDDExecutionContext getContext() {
        return context;
    }

    public MDDBinder getBinder() {
        return binder;
    }

    public MethodParametersViewComponent getComponent() {
        return component;
    }

}
