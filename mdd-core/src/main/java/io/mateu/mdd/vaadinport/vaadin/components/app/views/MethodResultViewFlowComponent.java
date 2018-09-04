package io.mateu.mdd.vaadinport.vaadin.components.app.views;

import com.google.common.base.Strings;
import com.vaadin.ui.Component;
import com.vaadin.ui.VerticalLayout;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.interfaces.PersistentPOJO;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.EditorViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.MethodResultViewComponent;
import io.mateu.mdd.vaadinport.vaadin.components.oldviews.WizardComponent;

import javax.persistence.Entity;
import javax.persistence.Query;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.Collection;
import java.util.Map;
import java.util.Set;

public class MethodResultViewFlowComponent extends VerticalLayout {

    private final Method method;
    private final Object result;

    @Override
    public String toString() {
        if (result != null && result instanceof WizardPage) {
            return Helper.capitalize(result.getClass().getSimpleName());
        } else {
            String t = Helper.capitalize(method.getName());
            if (method.isAnnotationPresent(Action.class) && !Strings.isNullOrEmpty(method.getAnnotation(Action.class).value())) t = method.getAnnotation(Action.class).value();
            return "Result of " + t;
        }
    }

    public MethodResultViewFlowComponent(String state, Method method, Object result) {
        this.result = result;
        this.method = method;


        if (!MDD.isMobile()) setSizeFull();

        addStyleName("methodresultflowcomponent");

        if (result instanceof Component) addComponent((Component) result);
        else if (!method.isAnnotationPresent(Output.class) && isPOJO(result)) addComponent(new EditorViewComponent(result));
        else if (result instanceof WizardPage) {
            try {
                addComponent(new WizardComponent((WizardPage) result));
            } catch (Exception e) {
                MDD.alert(e);
            }
        }
        else addComponent(new MethodResultViewComponent(method, result));

    }

    private boolean isPOJO(Object o) {
        boolean pojo = false;

        if (o != null && (o.getClass().isAnnotationPresent(Entity.class) || PersistentPOJO.class.isAssignableFrom(o.getClass()) ||
                (
                        !o.getClass().isArray()
                        && !o.getClass().isEnum()
                        && !(o instanceof URL)
                                && !(o instanceof Query)
                        && !(o instanceof String)
                                && !(Integer.class.equals(o.getClass()))
                                && !(Long.class.equals(o.getClass()))
                                && !(Float.class.equals(o.getClass()))
                                && !(Double.class.equals(o.getClass()))
                                && !(Boolean.class.equals(o.getClass()))
                        && !o.getClass().isPrimitive()
                        && !o.getClass().isSynthetic()
                        && !Collection.class.isAssignableFrom(o.getClass())
                                && !Set.class.isAssignableFrom(o.getClass())
                                && !Map.class.isAssignableFrom(o.getClass())
                        && !(o instanceof RpcView)
                                && !(o instanceof WizardPage)
                        )
        )) pojo = true;

        return pojo;
    }

}
