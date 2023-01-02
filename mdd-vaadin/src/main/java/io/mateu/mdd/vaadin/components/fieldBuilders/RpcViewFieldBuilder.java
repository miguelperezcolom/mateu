package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.HasValue;
import com.vaadin.data.Validator;
import com.vaadin.ui.*;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.interfaces.AbstractStylist;
import io.mateu.mdd.shared.annotations.FieldGroup;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.vaadin.components.views.RpcListViewComponent;
import io.mateu.mdd.vaadin.data.MDDBinder;
import io.mateu.reflection.ReflectionHelper;

import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Map;

public class RpcViewFieldBuilder extends AbstractFieldBuilder {


    public boolean isSupported(FieldInterfaced field) {
        boolean ok = RpcView.class.isAssignableFrom(field.getType());
        return ok;
    }

    @Override
    public Component build(VerticalLayout fieldGroup, HorizontalLayout fieldGroupHeader, FieldInterfaced field,
                           Object object, Layout container, MDDBinder binder,
                           Map<HasValue, List<Validator>> validators, AbstractStylist stylist,
                           Map<FieldInterfaced, Component> allFieldContainers, boolean forSearchFilter,
                           Map<String, List<AbstractAction>> attachedActions) {
        Component r = new Label("Failed to build the list");

        try {
            if (object != null) {
                RpcView rpcView = (RpcView) ReflectionHelper.getValue(field, object);
                if (rpcView != null) {
                    r = new RpcListViewComponent(field, rpcView).build(fieldGroup, fieldGroupHeader);
                } else {
                    rpcView = (RpcView) ReflectionHelper.newInstance(field.getType());
                    ReflectionHelper.setValue(field, object, rpcView);
                    r = new RpcListViewComponent(field, rpcView).build(fieldGroup, fieldGroupHeader);
                }
            } else {
                r = new RpcListViewComponent(field, field.getType()).build(fieldGroup, fieldGroupHeader);
            }
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InstantiationException e) {
            e.printStackTrace();
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (allFieldContainers != null) allFieldContainers.put(field, r);

       if (!field.isAnnotationPresent(FieldGroup.class)) r.setCaption(ReflectionHelper.getCaption(field));

        addComponent(container, r, attachedActions.get(field.getName()));

        container.addComponent(r);

        return r;
    }

    protected void bind(MDDBinder binder, TwinColSelect<Object> tf, FieldInterfaced field) {

    }


}
