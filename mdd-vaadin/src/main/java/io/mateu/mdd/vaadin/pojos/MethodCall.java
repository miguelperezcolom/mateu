package io.mateu.mdd.vaadin.pojos;

import io.mateu.mdd.core.app.Callback;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.reflection.CoreReflectionHelper;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;
import io.mateu.mdd.vaadin.components.views.EditorListener;
import io.mateu.mdd.vaadin.components.views.ListViewComponent;
import io.mateu.mdd.vaadin.components.views.MethodParametersViewComponent;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.mdd.vaadin.views.ComponentView;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.ArrayList;

public class MethodCall {

    private final Object instance;
    private final Method method;
    private final Callback onGoBack;


    public MethodCall(Object instance, Method method, Callback onGoBack) {
        this.instance = instance;
        this.method = method;
        this.onGoBack = onGoBack;
    }

    public Object getInstance() {
        return instance;
    }

    public Method getMethod() {
        return method;
    }

    public void onGoBack(Object model) {
        if (onGoBack != null) onGoBack.onSuccess(model);
    }

    public Object process() {
        boolean hasNonInjectedParameters = false;

        for (Parameter p : method.getParameters()) if (!ReflectionHelper.isInjectable(method, p)) {
            hasNonInjectedParameters = true;
            break;
        }

        if (hasNonInjectedParameters) {
            MethodParametersViewComponent mpvc =
                    new MethodParametersViewComponent(instance, method, MDDUIAccessor.getPendingSelection());
            AbstractViewComponent lastViewComponent = MateuUI.get().getStack().getLast().getViewComponent();
            if (lastViewComponent instanceof ListViewComponent) {
                mpvc.setListViewComponent((ListViewComponent) lastViewComponent);
            }
            mpvc.addEditorListener(new EditorListener() {
                @Override
                public void preSave(Object model) throws Throwable {

                }

                @Override
                public void onSave(Object model) {

                }

                @Override
                public void onGoBack(Object model) {
                    MethodCall.this.onGoBack(model);
                }
            });
            return mpvc;
        } else {
            try {
                return CoreReflectionHelper.execute(method, new MDDBinder(new ArrayList<>()), instance, MDDUIAccessor.getPendingSelection());
            } catch (Throwable e) {
                Notifier.alert(e);
            }
            return null;
        }

    }
}
