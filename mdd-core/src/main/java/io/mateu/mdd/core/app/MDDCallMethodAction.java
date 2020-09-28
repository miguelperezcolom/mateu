package io.mateu.mdd.core.app;


import com.vaadin.ui.Component;
import io.mateu.reflection.ReflectionHelper;

import java.lang.reflect.Method;

public class MDDCallMethodAction extends AbstractAction {

    public final Method method;
    public final String state;
    public final Object instance;
    public final Component lastViewComponent;
    public final String methodName;
    public final Class type;

    public MDDCallMethodAction(String name, Class type, String methodName) {
        this(name, null, null, null, null, methodName, type);
    }

    public MDDCallMethodAction(String name, String state, Method method, Object instance, Component lastViewComponent) {
        this(name, state, method, instance, lastViewComponent, null, null);
    }

    public MDDCallMethodAction(String name, String state, Method method, Object instance, Component lastViewComponent, String methodName, Class type) {
        super(name);
        this.state = state;
        this.method = method != null?method:ReflectionHelper.getMethod(type, methodName);
        this.instance = instance;
        this.lastViewComponent = lastViewComponent;
        this.methodName = methodName;
        this.type = type;
    }

}
