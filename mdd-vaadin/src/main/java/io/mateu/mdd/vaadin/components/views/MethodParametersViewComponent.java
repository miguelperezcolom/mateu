package io.mateu.mdd.vaadin.components.views;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDRunnableAction;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.reflection.CoreReflectionHelper;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.navigation.View;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.notification.Notifier;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Set;

@Slf4j
public class MethodParametersViewComponent extends EditorViewComponent {

    private final Method method;
    private final Object bean;
    private final Set pendingSelection;

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.FORM;
    }

    private Class parametersType;
    private Object paremetersModel;

    public MethodParametersViewComponent(Object bean, Method method, Set pendingSelection) {
        super(createClass(method));
        this.bean = bean;
        this.method = method;
        this.pendingSelection = pendingSelection;
        setModel(createInstance());
    }

    private Object createInstance() {
        Object instance = null;
        try {
            instance = ReflectionHelper.newInstance(getModelType());
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        }
        return instance;
    }

    private static Class createClass(Method method) {
        Class type = null;
        try {
            type = ReflectionHelper.createClass(
                    MDD.getClassPool(),
                    MDDBinder.class,
                    MDD.getClassPool().getClassLoader(),
                    "" + method.getDeclaringClass().getSimpleName()
                            + "_" + method.getName() + "_Parameters000",
                    ReflectionHelper.getAllFields(method), false);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return type;
    }

    @Override
    public String getTitle() {
        return toString();
    }

    @Override
    public String toString() {
        String t = Helper.capitalize(method.getName());
        if (method.isAnnotationPresent(Action.class)
                && !Strings.isNullOrEmpty(method.getAnnotation(Action.class).value()))
            t = method.getAnnotation(Action.class).value();
        return t;
    }

    @Override
    public List<AbstractAction> getMainActions() {
        return Lists.newArrayList(new MDDRunnableAction(toString()) {
            @Override
            public void run() {
                if (validate()) {
                    try {
                        Object r = CoreReflectionHelper.execute(method, getBinder().getBean(), bean, pendingSelection);
                        if (bean != null && void.class.equals(method.getReturnType())) {
                            if (method.isAnnotationPresent(Action.class)
                                    && method.getAnnotation(Action.class).saveAfter()) {
                                ViewStack stack = MateuUI.get().getStack();
                                View v = stack.size() >= 2?stack.get(stack.size() - 2):null;
                                if (v != null && v.getViewComponent() instanceof EditorViewComponent)
                                    ((EditorViewComponent) v.getViewComponent()).save(false);
                            }
                        } else {
                            MDDUIAccessor.setPendingResult(r);
                            //todo: ver si es necesario rellenar el last method call
                            //MDDUIAccessor.setLastMethodCall(method);
                        }
                        if (r == null || void.class.equals(method.getReturnType())) {
                            Notifier.info("Done");
                            MDDUIAccessor.goBack();
                        } else MDDUIAccessor.go("result");
                    } catch (Throwable e) {
                        Notifier.alert(e);
                    }
                }
            }
        }.setIcon(VaadinIcons.BOLT));
    }

}
